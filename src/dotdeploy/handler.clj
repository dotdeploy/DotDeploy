(ns dotdeploy.handler
  (:import (java.util UUID))
  (:require [dotdeploy.middleware :refer [wrap-dir-index
                                          wrap-response-logger
                                          wrap-request-logger
                                          wrap-authentication-handler
                                          access-control-header]]
            [dotdeploy.http :as http]
            [dotdeploy.user :as user]
            [clojure.walk :refer [keywordize-keys]]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.format-response :refer [wrap-restful-response]]
            [ring.middleware.json :refer [wrap-json-body]]
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
                    (context "/manifest.csv" []
                             (GET "/" [] (http/ok (user/get-manifest machine-id)))
                             (OPTIONS "/" [] (http/options [:get :options])))
                    (context "/register" []
                             (POST "/" [:as req]
                                   (let [headers (keywordize-keys (req :headers))]
                                     (if (user/create-machine (:x-token headers) machine-id (:x-hostname headers))
                                       (http/created (str "/api/machine/" machine-id "/manifest"))
                                       (http/conflict))))
                             (OPTIONS "/" [] (http/options [:post :options])))
                    (context "/manifest" []
                             (GET "/" [] (http/not-implemented))
                             (OPTIONS "/" [] (http/options [:get :options])))
                    (context "/file" [machine-id]
                             (GET "/:id" [id] (http/not-implemented))
                             (POST "/" [:as req]
                                   (let [headers (keywordize-keys (req :headers))
                                         user-id (.toString (:user-id (user/machine->user machine-id)))
                                         location (user/create-file (:body req) (:x-path headers) user-id)]
                                     (if location
                                       (http/created (str "/api/machine/" machine-id "/file/" location))
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
                    (GET "/token" [:as req]
                         (let [req (keywordize-keys req)
                               user-id (:user-id (:query-params req))
                               times (or (:times (:query-params req)) 1)
                               expriation-date (or (:expiration (:query-params req)) :none)
                               token (str (UUID/randomUUID))]
                           (if (user/create-token user-id {:token token :times times :expiration-date expriation-date})
                             (http/created nil token)
                             (http/conflict))))
                    (GET "/user/:user-id" [user-id :as req]
                         (let [user (user/get-user user-id )]
                           (http/ok (user/build-profiles user))))
                    (PATCH "/user/:user-id/machine/:machine-id" [user-id machine-id :as req]
                           ; TODO: Verify that this machine-id belongs to this user-id
                           (let [body (:body req)]
                             (if (user/update-machine body machine-id)
                               (http/ok nil)
                               (http/conflict))))
                    (OPTIONS "/user/:user-id/machine/:machine-id" [user-id machine-id]
                             (http/options [:patch]))
                    (GET "/user/:user-id/file/:file-id" [user-id file-id]
                         (user/get-file file-id))
                    (PATCH "/user/:user-id/file/:file-id" [user-id file-id :as req]
                           ; TODO: Verify that this file-id belongs to this user-id
                           (let [body (:body req)]
                             (if (user/update-file body file-id)
                               (http/ok nil)
                               (http/conflict))))
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
      (wrap-json-body)
      (wrap-request-logger)
      (wrap-response-logger)
      (wrap-restful-response)
      (access-control-header)))


(def app
  "Application entry point & handler chain"
  (routes
    static
    machine
    site))
