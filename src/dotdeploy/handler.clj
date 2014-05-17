(ns dotdeploy.handler
  (:require [dotdeploy.middleware :refer [wrap-dir-index]]
            [compojure.handler :as handler]
            [compojure.route :as route]
            [compojure.core :refer [ANY DELETE GET HEAD OPTIONS POST
                                    PUT context defroutes routes]]))

(defroutes static-file-routes
           "Routes for anything not contained in the API"
           (route/resources "/" {:root "public/static"})
           (route/resources "/static/js" {:root "public/js"})
           (route/resources "/static/css" {:root "public/css"}))


(def app
  "Application entry point & handler chain"
  (routes
    (-> (handler/api static-file-routes)
        (wrap-dir-index))))
