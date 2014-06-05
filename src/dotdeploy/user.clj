(ns dotdeploy.user
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [monger.result :refer [ok?]]
            [monger.util :as util]
            [schema.core :as s]
            [clj-time.core :as time]
            [clj-time.format :as time-format]
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

(defn date->string
  [datetime]
  (time-format/unparse (time-format/formatters :date-time) datetime))

(defn string->date
  [datetime]
  (time-format/parse (time-format/formatters :date-time) datetime))

(defn serialize-user
  "Make a User model safe to insert into the database"
  [user]
  (assoc user :created-on (date->string (:created-on user))))

(defn deserialize-user
  "Take a user from the database and turn it into a User object"
  [user]
  (-> user
      (dissoc :_id)
      (assoc :created-on (string->date (:created-on user)))))

(defn get-user
  "Retrieve a User from the database by user-id"
  [user-id]
  (if-let [user (mc/find-one-as-map (get-db) (:users-coll mongo-options)
                                    {:user-id user-id})]
    (deserialize-user user)))

(defn create-user
  "Place a new User in the database. Must be a valid User, returns True if successfully inserted, otherwise False"
  [user]
  (ok? (mc/insert (get-db)
                  (:users-coll mongo-options)
                  (serialize-user (s/validate models/User user)))))

(defn get-or-create-user
  "Retrieve a user from the database if it exists, otherwise create a new one"
  [user-id]
  (if-let [user (get-user user-id)]
    user
    (let [profile (auth/get-user-profile user-id)
          name    (str (-> profile :name :givenName) " " (-> profile :name :familyName))
          user    {:created-on (time/now)
                   :user-id user-id
                   :name name
                   :machines []
                   :files []
                   :tokens []}]
      (if (create-user user)
        user
        (throw (.Exception "Could not create user"))))))
