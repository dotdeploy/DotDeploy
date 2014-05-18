(ns dotdeploy.user
  (:require [dotdeploy.files :as files]
            [monger.core :as mg]
            [monger.collection :as mc]
            [monger.result :refer [ok?]]
            [monger.util :as util]
            [clj-time.core :as time]
            [slingshot.slingshot :refer [throw+]]))

;;;; MongoDB Connection

(def mongo-options
  {:db                  "dotdeploy"
   :users-collection    "users"
   :files-collection    "files"})

(let [conn (mg/connect)
      db   (mg/get-db conn (:db mongo-options))]
  (if-not (mc/exists? db (:users-collection mongo-options))
    (mc/create db (:users-collection mongo-options) {:capped false})))

;;;; MongoDB Utility Functions

(defn with-oid
  "Add a new Object ID to a Recipe"
  [recipe]
  (assoc recipe :_id (util/object-id)))

(defn created-now
  "Set the created time in a Recipe to the current time"
  [recipe]
  (assoc recipe :created (time/now)))

;;;; Database manipuation functions

(defn get-user
  "Retrieve a User from the database by id, or nil if it doesn't exist"
  [user-id]
  (let [conn (mg/connect)
        db   (mg/get-db conn (:db mongo-options))]
    (mc/find-one-as-map db (:users-collection mongo-options) {:user-id user-id})))

(defn create-user
  "Create a new user in the database"
  [user-id profile]
  (let [user {:user-id user-id :name (:displayName profile)}
        new-user (created-now (with-oid user))
        conn (mg/connect)
        db   (mg/get-db conn (:db mongo-options))]
    (if (ok? (mc/insert db (:users-collection mongo-options) new-user))
      new-user
      (throw+ {:type ::failed} "Create user failed"))))

(defn get-files
  "Returns the files object for the user that owns this machine"
  [machine-id]
  ; TODO: implement get-files
  machine-id)

(defn add-file
  "Add a new file to GridFS and return the revision number of the added file"
  ([f machine-id filename]
    (add-file f machine-id (files/extract-filetype filename) filename))
  ([f machine-id filename revision]
    (add-file f machine-id (files/extract-filetype filename) filename revision))
  ([f machine-id type filename revision]
   (when-let [gridfs-id (files/persist filename f)]
     ; TODO: Finish this
     gridfs-id)))
