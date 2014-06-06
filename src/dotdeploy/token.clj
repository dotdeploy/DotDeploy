(ns dotdeploy.token
  (:require [dotdeploy.models :as models]
            [dotdeploy.user :as user]
            [clj-time.core :as time]
            [schema.core :as s]))

(defn- filter-keys
  "Return a filtered version of a map based on a set of keys.
   Ex: (filter-keys {:expiration \"June 6 2014\" :house true} #{:expiration :uses})
   ==> {:expiration \"June 6 2014\"}"
  [map keys]
  (into {} (filter #((key %) keys) map)))

(defn uuid
  "Generate a random UUID using the built in Java library"
  []
  (str (java.util.UUID/randomUUID)))

(defn create-token
  "Create an return a new token for a user with given user-id.
   Options parameter should be a map with one or both of the following keys:
     - :expires-on  DateTime  Date when this token will expire, regardless of number of uses
     - :uses        int       Number of times this token can be used to authorize a new computer
     - :description String    Description which should be associated with machines create with this key"
  [user-id options]
  (let [valid-args (filter-keys options #{:expires-on :uses :description})
        new-token (-> valid-args
                      (assoc :created-on (time/now))
                      (assoc :token-id (uuid)))]
    (if (user/update-user user-id {"$push" {:tokens (s/validate models/Token new-token)}})
      new-token
      (throw (Exception. "Unable to create new token")))))









