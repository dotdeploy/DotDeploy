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
                                    PATCH context defroutes routes]]))

(defroutes machine-api
           "Routes used by the client library"
           (context "/api/machine/:machine-id" [machine-id]
                    ; FIXME: Create middleware to test if the machine-id exists (or maybe not, for register)
                    (HEAD "/" [] (http/not-implemented))
                    (OPTIONS "/" [] (http/options [:head :options]))
                    (context "/register" []
                             (GET "/" [] (http/not-implemented))
                             (OPTIONS "/" [] (http/options [:get :options])))
                    (context "/manifest" []
                             (GET "/" [] (http/not-implemented))
                             (OPTIONS "/" [] (http/options [:get :options])))
                    (context "/file" [machine-id]
                             (GET "/:id" [id] (http/not-implemented))
                             (POST "/" [:as req]
                                   (let [headers (keywordize-keys (req :headers))
                                         user-id (user/machine->user machine-id)
                                         location (user/create-file (:body req) (:x-path headers) user-id)]
                                     (if location
                                       (http/created (str "/api/machine/" machine-id "file/" location))
                                       (http/conflict))))
                             (PATCH "/" [:as req]
                                    (let [headers (keywordize-keys (req :headers))
                                          location (user/update-file (:body req) (:file-id headers) (:previous-revision headers))]
                                      (if location
                                        (http/created location)
                                        (http/conflict))))
                             (OPTIONS "/" [] (http/options [:get :post :patch :options])))
                    (ANY "*" [] (http/method-not-allowed [:head]))))

(defroutes site-api
           "Routes used by the website and last point of searching for a handler"
           (context "/api/site" []
                    (HEAD "/" [] (http/not-implemented))
                    (GET "/user/:user-id" [user-id :as req]
                         (let [user (user/get-user user-id )]
                           (-> (http/ok user)
                               (header "Access-Control-Allow-Origin" "http://localhost"))))
                    (ANY "*" [] (http/method-not-allowed [:head])))
           (route/not-found "That's not a valid request"))

(defroutes static-file-routes
           "Server static files outside of the API functions"
           (route/resources "/" {:root "public/static"})
           (context "/static" []
                    (route/resources "/lib" {:root "public/lib"})
                    (route/resources "/js" {:root "public/js"})
                    (route/resources "/css" {:root "public/css"})
                    (route/resources "/font" {:root "public/font"})
                    (ANY "*" [] (http/method-not-allowed []))))

(def static
  (-> (handler/api static-file-routes)
      (wrap-dir-index)))

(def machine
  (-> (handler/api machine-api)
      (wrap-request-logger)
      (wrap-response-logger)))

(def site
  (-> (handler/api site-api)
      (wrap-authentication-handler)
      (wrap-params)
      (wrap-request-logger)
      (wrap-response-logger)
      (wrap-restful-response)))


(def app
  "Application entry point & handler chain"
  (routes
    static
    machine
    site))
