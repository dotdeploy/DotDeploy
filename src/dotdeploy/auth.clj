(ns dotdeploy.auth
  (:require [clj-http.client :as http]
            [clojure.data.json :as json]))

(def google-oauth2
  (json/read-str (slurp "client-keys.json")
                 :key-fn keyword))

(defn get-user-profile
  "Lookup the profile information for a user-id"
  [user-id]
  ((http/get (str "https://www.googleapis.com/plus/v1/people/"
                  user-id
                  "?key="
                  (google-oauth2 :api-key))
             {:as :json}) :body))

(defn authorize-google-code
  "Return the user-id of the access token if valid, otherwise Nil"
  [accesstoken]
  (let [valid ((http/get (str "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" accesstoken)
                         {:as :json}) :body)]
    ;; FIXME: I believe thise will not even get to here if the token is invalid)

    (if (not= (:audience valid) (:client-id google-oauth2))
      ;; TODO: Throw an exception or something for this invalid token
     "test" )

    (:user_id valid)))
