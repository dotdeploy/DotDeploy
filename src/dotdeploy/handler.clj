(ns dotdeploy.handler
  (:require [compojure.api.sweet :refer :all]
            [ring.util.http-response :refer :all]
            [dotdeploy.models :refer :all]
            [clj-time.coerce :as tc]
            [dotdeploy.auth :as auth]
            [dotdeploy.user :as user]))

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
                   (ok (user/get-or-create-user (auth/authorize-google-code accesstoken)))))
  (swaggered "token"
             :description "A code to add a new machine to a user"
             (context "/token" []
                      legacy-route ;; For some reason being in a context doesn't work without this
                      (GET* "/:token-id" [token-id]
                            :summary "Retrieve details about a given token"
                            (ok token-id))
                      (POST* "/" []
                             :body [token NewToken {:description "2014-02-18T12:01:20.147Z"}]
                             :return Token
                             (ok (assoc token :token-id "New ID"))))))

(def app
  api)
