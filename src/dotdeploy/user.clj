(ns dotdeploy.user
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [monger.result :refer [ok?]]
            [monger.util :as util]
            [schema.core :as s]
            [clj-time.core :as time]
            [dotdeploy.auth :as auth]
            [dotdeploy.models :as models]))

;;;; MongoDB Connection

(def mongo-options
  {:db         "dotdeploy"
   :users-coll "users"
   :files-coll "files"})

(defn get-db
  "Retrieve an active DB connection through Monger"
  []
  (mg/get-db (mg/connect) (:db mongo-options)))

;; Ensure that the collections exist
(let [db (get-db)]
  (if-not (mc/exists? db (:users-coll mongo-options))
    (mc/create db (:users-coll mongo-options) {:capped false})))

;;;; User Operations

(def blank-user
  {:created-on (time/now)
   :machines []
   :files []
   :tokens []})

(defn get-user
  "Retrieve a User from the database by user-id"
  [user-id]
  (mc/find-one-as-map (get-db) (:users-coll mongo-options)
                      {:user-id user-id}))

(defn create-user
  "Place a new User in the database. Must be a valid User, returns True if successfully inserted, otherwise False"
  [user]
  (s/validate models/User user)
  (ok? (mc/insert (get-db) (:users-coll mongo-options) user)))

(defn get-or-create-user
  "Retrieve a user from the database if it exists, otherwise create a new one"
  [user-id]
  (if-let [user (get-user user-id)]
    user
    (let [profile {:name "Tony Grosinger"}
          user (-> blank-user
                   (assoc :user-id user-id)
                   (assoc :name (:name profile)))]
      (create-user user)
      user)))
