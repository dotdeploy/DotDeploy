(ns dotdeploy.token
  (:require [dotdeploy.models :as models]
            [dotdeploy.user :as user]
            [dotdeploy.data :as data]
            [monger.collection :as mc]
            [clj-time.core :as time]
            [schema.core :as s]))

;;;; Token Utilities

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

(defn token->user
  "Retrieve the User which owns a Token with the given token-id"
  [token-id]
  (mc/find-one-as-map (data/get-db)
                      (:users-coll data/mongo-options)
                      {:tokens.token-id token-id}))

;;;; Somewhat General Utilities

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

;;;; Token Manipulation Functions

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
  (if-let [user (token->user token-id)]
    (first (filter #(= token-id (:token-id %)) (:tokens user)))))

(defn delete-token
  "Delete a Token from a User and return the list of valid tokens"
  [token-id]
  (if-let [user (token->user token-id)]
    (if (user/update-user (:user-id user) {"$pull" {:tokens {:token-id token-id}}})
      (get-valid-tokens (:user-id user)))))

(defn decrement-uses
  "Consumes one use from a token, if uses is set"
  [token]
  (if-let [uses (:uses token)]
    (if (= 0 (dec uses))
      (delete-token (:token-id token))
      (data/update {:tokens.token-id (:token-id token)}
                   {"$set" {:tokens.$.uses (dec uses)}}))))

(defn use-token
  "Check that the token is valid, decrement the number of uses this token has left,
   delete if if fully consumed. If everything is valid, return the description
   associated with the token to be bound to the new machine."
  [token-id]
  (if-let [token (get-token token-id)]
    (if (valid? token)
      (do (decrement-uses token)
          {:description (:description token) :user (token->user token-id)})
      (throw (Exception. "Token is invalid")))
    (throw (Exception. "Token is invalid"))))
