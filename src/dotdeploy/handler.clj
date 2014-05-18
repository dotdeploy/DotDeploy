(ns dotdeploy.handler
  (:require [dotdeploy.middleware :refer [wrap-dir-index
                                          wrap-response-logger
                                          wrap-request-logger]]
            [dotdeploy.http :as http]
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
                    (GET "/manifest" [] (http/not-implemented))))

(defroutes site-api
           "Routes used by the website and last point of searching for a handler"
           (context "/api/site" []
                    (HEAD "/" [] (http/not-implemented))
                    (GET "/" [] (http/not-implemented)))
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
        (wrap-request-logger)
        (wrap-response-logger))))
