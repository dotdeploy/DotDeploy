(ns dotdeploy.user
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [monger.result :refer [ok?]]
            [monger.util :as util]
            [monger.joda-time :as joda-time]
            [clj-time.core :as time]
            [schema.core :as s]
            [dotdeploy.auth :as auth]
            [dotdeploy.models :as models]
            [dotdeploy.data :as data]))

(defn get-user
  "Retrieve a User from the database by user-id"
  [user-id]
  (if-let [user (mc/find-one-as-map (data/get-db)
                                    (:users-coll data/mongo-options)
                                    {:user-id user-id})]
    (dissoc user :_id)))

(defn create-user
  "Place a new User in the database. Must be a valid User, returns True if successfully inserted, otherwise False"
  [user]
  (ok? (mc/insert (data/get-db)
                  (:users-coll data/mongo-options)
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
     (data/update {:user-id user-id} updates upsert)))

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



