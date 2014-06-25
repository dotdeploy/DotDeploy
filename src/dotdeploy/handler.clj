(ns dotdeploy.handler
  (:require [compojure.api.sweet :refer :all]
            [compojure.api.meta :as meta]
            [ring.util.http-response :refer :all]
            [dotdeploy.models :refer :all]
            [clj-time.coerce :as tc]
            [schema.core :as s]
            [dotdeploy.auth :as auth]
            [dotdeploy.user :as user]
            [dotdeploy.token :as token]
            [dotdeploy.file :as file]
            [dotdeploy.machine :as machine]))

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
                            ;; TODO: Add an optional parameter to only retrieve valid tokens
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
                               :summary "Delete a token by the token-id and retrive a list
                                         of the remaining valid tokens"
                               :query-params [accesstoken :- String
                                              token-id    :- String]
                               :return [Token]
                               (ok (token/delete-token token-id)))))
  (swaggered "machine"
             :description "A user's computer which can receive/update dotfiles"
             (context "/machine" []
                      legacy-route ;; For some reason being in a context doesn't work without this
                      (GET* "/" []
                            :summary "Retrieve a list of all machines for a user"
                            ;; TODO: Add an optional parameter to only retrieve active machines
                            :query-params [accesstoken :- String]
                            :return [Machine]
                            (let [user-id (auth/authorize-google-code accesstoken)]
                              (ok (machine/get-machines user-id))))
                      (POST* "/" []
                             :summary "Create a new machine based on the provided token-id"
                             :query-params [token-id   :- String
                                            hostname   :- String
                                            machine-id :- String]
                             ;:return Machine
                             ;; FIXME: Can not specify return type here because invalid requests throw exceptions which return as a string. Can not see the exception if trying to return a Machine
                             (ok (machine/create-machine machine-id hostname token-id)))
                      (DELETE* "/" []
                              :summary "Delete a machine by the machine-id and retrieve a list
                                        of the remaining valid tokens"
                              :query-params [accesstoken :- String
                                             machine-id  :- String]
                              :return [Machine]
                              (let [user-id (auth/authorize-google-code accesstoken)]
                                (ok (machine/delete-machine machine-id user-id))))))
  (swaggered "file"
             :description "A specific dotfile for a user"
             (context "/file" []
                      legacy-route ;; For some reason being in a context doesn't work without this
                      (GET* "/:file-id" [file-id]
                            :summary "Retrieve the latest version of a file by id"
                            ;; TODO: Add an optional parameter to retrieve a specific version
                            :query-params [accesstoken :- String]
                            (let [user-id (auth/authorize-google-code accesstoken)]
                              (ok (file/get-file-binary user-id file-id))))
                      (POST* "/" []
                             :summary "Create a new file for the user with the provided accesstoken"
                             :query-params [accesstoken :- String
                                            path   :- String
                                            sha256 :- String]
                             :body [body s/Str]
                             ;(let [user-id (auth/authorize-google-code accesstoken)]
                               ;(ok (file/create-file user-id path sha256 content)))
                             (ok "test")))))

(def app
  api)





