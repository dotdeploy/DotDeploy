(ns dotdeploy.handler
  (:require [clojure.walk :refer [keywordize-keys]]
            [compojure.core :refer :all]
            [compojure.handler :refer [api]]
            [ring.middleware.format-response :refer [wrap-restful-response]]
            [ring.util.response :refer [redirect file-response header get-header]]
            [ring.middleware.json :refer [wrap-json-body]]
            [ring.middleware.resource :refer [wrap-resource]]
            [dotdeploy.models :refer :all]
            [clj-time.coerce :as tc]
            [schema.core :as s]
            [dotdeploy.http :as http]
            [dotdeploy.auth :as auth]
            [dotdeploy.user :as user]
            [dotdeploy.token :as token]
            [dotdeploy.file :as file]
            [dotdeploy.machine :as machine]))

;; TODO: Modify this middleware to also intelligently handly machine-ids
(defn wrap-authentication
  "Convert accesstokens into a user-id"
  [handler]
  (fn [req]
    (if-let [accesstoken (:accesstoken (:params req))]
      (handler (assoc-in req [:params :user-id] (auth/authorize-google-code accesstoken)))
      (throw (Exception. "There is no accesstoken!")))))

(defn wrap-access-control-headers
  "Add Access-Control-Allow-Origin headers to enable javascript requets"
  [handler]
  (fn [req]
    (if-let [origin (get-header req "origin")]
      (if (#{"http://localhost"  "http://dotdeploy.works"
             "https://localhost" "https://dotdeploy.works"} origin)
        (-> req
            handler
            (header "Access-Control-Allow-Origin" origin))
        (handler req))
      (handler req))))

(defroutes authenticated-routes*
  (context "/user" []
           (GET "/" {{user-id :user-id} :params}
                (http/ok (user/get-or-create-user user-id))))
  (context "/token" []
           (GET "/" {{user-id :user-id} :params}
                (http/ok (token/get-tokens user-id)))
           (POST "/" {{user-id :user-id} :params
                      newToken           :body}
                 (http/created (token/create-token user-id (s/validate NewToken newToken))))
           (DELETE "/" {{token-id :token-id} :params}
                   (http/ok (token/delete-token token-id))))
  (context "/machine" []
           (GET "/" {{user-id :user-id} :params}
                (http/ok (machine/get-machines user-id)))
           (POST "/" {{token-id   :token-id
                       hostname   :hostname
                       machine-id :machine-id} :params}
                 (http/ok (machine/create-machine machine-id hostname token-id)))
           (DELETE "/" {{user-id    :user-id
                         machine-id :machine-id} :params}
                   (http/ok (machine/delete-machine machine-id user-id))))
  (context "/file" []
           (GET "/:file-id" {{user-id :user-id
                              file-id :file-id} :params}
                (http/ok (file/get-file-binary user-id file-id)))
           (POST "/" {{user-id :user-id
                       path    :path
                       sha256  :sha256} :params
                       content          :body}
                 (http/ok (file/create-file user-id path sha256 content)))))
(def authenticated-routes
  (-> #'authenticated-routes*
      (wrap-authentication)
      (wrap-json-body {:keywords? true})
      (wrap-restful-response)
      (wrap-access-control-headers)))

(defroutes other-routes
  "These routes do not require the accesstoken or machine-id and are used for
  anything that is unsecured such as OPTIONS requests or catching invalid methods"
  (context "/user" []
           (OPTIONS "/" []
                    (http/options [:options :get])))
  (context "/token" []
           (OPTIONS "/" []
                    (http/options [:options :get :post :delete])))
  (context "/machine" []
           (OPTIONS "/" []
                    (http/options [:options :get :post :delete])))
  (context "/file" []
           (OPTIONS "/" []
                    (http/options [:options :get :post])))
  (context "/api-docs" []
           (GET "/" [] (file-response "resources/api-docs/root.json"))
           (GET "/:resource" [resource] (file-response (str "resources/api-docs/" resource ".json")))))

;; TODO: Catch exceptions such as validation exceptions and give helpful error messages

(def app
  (-> (api (routes
             (GET "/" [] (redirect "/index.html"))
             (ANY "*" [] other-routes)
             (ANY "*" [] authenticated-routes)))
      (wrap-resource "public")))





