(ns dotdeploy.site
  (:require [dotdeploy.data :as data]
            [clj-http.client :as http]
            [clojure.data.json :as json]))

(def google-com-oauth2
  (json/read-str (slurp "client-keys.json")
                 :key-fn keyword))

(defn get-user-profile
  "Lookup the profile information for a user id"
  [user-id]
  ((http/get (str "https://www.googleapis.com/plus/v1/people/" user-id "?key=" (google-com-oauth2 :api_key)) {:as :json}) :body))

(defn id-to-user
  "Retrieve a user based on the id or create if it doesn't exist"
  [user-id]
  (let [user (data/get-user user-id)]
    (if (nil? user)
      (data/create-user user-id (get-user-profile user-id))
      user)))

(defn authorize-google-code
  "Return the user associated with the access token if valid. Throws exception if token is invalid."
  [access_token]
  (let [valid ((http/get (str "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" access_token) {:as :json}) :body)]
    ; TODO: I believe this will not even get to here if the token is invalid
    (if-not (contains? valid :user_id)
      (throw+ {:type ::invalid_token} "Token is invalid or expired"))

    (if-not (= (valid :audience) (google-com-oauth2 :client_id))
      (throw+ {:type ::invalid_token} "Token is not issued for the correct audience"))

    (id-to-user (valid :user_id))))
