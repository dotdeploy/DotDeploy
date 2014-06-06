(ns dotdeploy.user
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [monger.result :refer [ok?]]
            [monger.util :as util]
            [monger.joda-time :as joda-time]
            [clj-time.core :as time]
            [schema.core :as s]
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

(defn get-user
  "Retrieve a User from the database by user-id"
  [user-id]
  (mc/find-one-as-map (get-db)
                      (:users-coll mongo-options)
                      {:user-id user-id}))

(defn create-user
  "Place a new User in the database. Must be a valid User, returns True if successfully inserted, otherwise False"
  [user]
  (ok? (mc/insert (get-db)
                  (:users-coll mongo-options)
                  (s/validate models/User user))))

(defn update-user
  "Update a User in the database, using a map containing the fields which should be changed.

  updates should be in the usual MongoDB format, for example:

  ;; Will change the name field to \"Tony Grosinger\"
  {\"$set\" {:name Tony Grosinger}}

  ;; Adds a value to the :tokens array
  {\"$push\" {:tokens \"a-new-token\"}}"
  ([user-id updates] (update-user user-id updates false))
  ([user-id updates upsert]
    (ok? (mc/update (get-db)
                    (:users-coll mongo-options)
                    {:user-id user-id}
                    updates
                    {:upsert upsert}))))

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



