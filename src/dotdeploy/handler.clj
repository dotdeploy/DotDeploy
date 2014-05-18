(ns dotdeploy.handler
  (:require [dotdeploy.middleware :refer [wrap-dir-index
                                          wrap-response-logger
                                          wrap-request-logger
                                          wrap-authentication-handler]]
            [dotdeploy.http :as http]
            [dotdeploy.user :as user]
            [clojure.walk :refer [keywordize-keys]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.format-response :refer [wrap-restful-response]]
            [ring.util.response :refer [content-type header]]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [compojure.core :refer [ANY DELETE GET HEAD OPTIONS POST
                                    PUT context defroutes routes]]))

(defroutes machine-api
           "Routes used by the client library"
           (context "/api/machine/:machine-id" [machine-id]
                    (HEAD "/" [] (http/not-implemented))
                    (GET "/" [] (http/method-not-allowed [:HEAD]))
                    (GET "/register" [] (http/not-implemented))
                    (GET "/manifest" [] (http/not-implemented))
                    (POST "/file" [:as req]
                          (let [headers (keywordize-keys (req :headers))
                                filename (:filename headers)
                                revision (if (:previous-revision headers)
                                           (inc (:previous-revision headers))
                                           1)]
                          (if (user/add-file (:body req) machine-id filename revision)
                            (http/created "test-location")   ; TODO: Return the URL where this file can be accessed
                            (http/conflict))))
                    (GET "/files/:id" [id])))

(defroutes site-api
           "Routes used by the website and last point of searching for a handler"
           (context "/api/site" []
                    (HEAD "/" [] (http/not-implemented))
                    (GET "/user/:user-id" [user-id :as req]
                         (let [user (user/get-user user-id )]
                           (-> (http/ok user)
                               (header "Access-Control-Allow-Origin" "http://localhost")))))
           (route/not-found "That's not a valid request"))

(defroutes static-file-routes
           "Server static files outside of the API functions"
           (route/resources "/" {:root "public/static"})
           (route/resources "/lib" {:root "public/lib"})
           (route/resources "/static/js" {:root "public/js"})
           (route/resources "/static/css" {:root "public/css"})
           (route/resources "/static/font" {:root "public/font"}))


(def app
  "Application entry point & handler chain"
  (routes
    (-> (handler/api static-file-routes)
        (wrap-dir-index))
    (-> (handler/api machine-api)
        (wrap-request-logger)
        (wrap-response-logger))
    (-> (handler/api site-api)
        (wrap-authentication-handler)
        (wrap-params)
        (wrap-request-logger)
        (wrap-response-logger)
        (wrap-restful-response))))
