(ns dotdeploy.handler
  (:require [compojure.api.sweet :refer :all]
            [ring.util.http-response :refer :all]
            [dotdeploy.models :refer :all]
            [clj-time.coerce :as tc]
            [dotdeploy.auth :as auth]
            [dotdeploy.user :as user]
            [dotdeploy.token :as token]))

(defroutes* legacy-route)

(defapi api
  (swagger-ui)
  (swagger-docs
    :title "DotDeploy API")
  (swaggered "user"
             :description "A user of the DotDeploy service"
             (GET* "/user" []
                   :query-params [accesstoken :- String]
                   :return User
                   :summary "Get details about the user which this token describes"
                   (let [user-id (auth/authorize-google-code accesstoken)
                         user (user/get-or-create-user user-id)]
                     (ok user))))
  (swaggered "token"
             ; FIXME: Umm, I think anyone can do anything, as long as they have a valid access-token
             :description "A code to add a new machine to a user"
             (context "/token" []
                      legacy-route ;; For some reason being in a context doesn't work without this
                      (GET* "/" []
                            :summary "Retrieve a list of all tokens for a user"
                            :query-params [accesstoken :- String]
                            :return [Token]
                            (let [user-id (auth/authorize-google-code accesstoken)]
                              (ok (token/get-tokens user-id))))
                      (POST* "/" []
                             :summary "Create a new token for the user with the provided accesstoken"
                             :query-params [accesstoken :- String]
                             :body [newtoken NewToken]
                             :return Token
                             (let [user-id (auth/authorize-google-code accesstoken)]
                               (created (token/create-token user-id newtoken))))
                      (DELETE* "/" []
                               :summary "Delete a token by the token-id and retrive a list of the remaining valid tokens"
                               :query-params [accesstoken :- String
                                              token-id    :- String]
                               :return [Token]
                               (ok (token/delete-token token-id))))))

(def app
  api)





