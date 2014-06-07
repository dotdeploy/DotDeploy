(ns dotdeploy.token
  (:require [dotdeploy.models :as models]
            [dotdeploy.user :as user]
            [dotdeploy.data :as data]
            [monger.collection :as mc]
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
    ;; TODO: Add stronger validation to make sure the required keys are present
    (if (user/update-user user-id {"$push" {:tokens (s/validate models/Token new-token)}})
      new-token
      (throw (Exception. "Unable to create new token")))))

(defn get-tokens
  "Retrieve a list of all Tokens for a User with a given user-id"
  [user-id]
  (if-let [user (user/get-user user-id)]
    (:tokens user)
    []))

(defn get-valid-tokens
  "Retrieve a list of only valid Tokens for a User with a given user-id"
  [user-id]
  (if-let [tokens (get-tokens user-id)]
    (filter valid? tokens)))

(defn get-token
  "Get a Token by the token-id"
  [token-id]
  (if-let [user (mc/find-one-as-map (data/get-db)
                                    (:users-coll data/mongo-options)
                                    {:tokens.token-id token-id})]
    (first (filter #(= token-id (:token-id %)) (:tokens user)))))

(defn expired?
  "Return true if the Token has expired"
  [token]
  (if-let [expiration (:expires-on token)]
    (and (not (nil? expiration))
             (time/before? expiration (time/now)))
    false))

(defn fully-used?
  "Return true if the Token has no more uses left"
  [token]
  (if-let [uses (:uses token)]
    (and (not (nil? uses))
         (> 1 uses))
    false))

(defn valid?
  "Return true if the Token is correctly formed, not expired, and not fully used"
  [token]
  (and (s/validate models/Token token)
       (not (or (expired? token)
                (fully-used? token)))))









