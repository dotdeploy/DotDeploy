(ns dotdeploy.user
  (:require [dotdeploy.files :as files]
            [dotdeploy.util :refer [when-let*]]
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

(defn machine->user
  "Retrieve a User fomr the database by machine-id"
  [machine-id]
  (let [conn (mg/connect)
        db (mg/get-db conn (:db mongo-options))]
    (mc/find-one-as-map db (:users-collection mongo-options) {:machines.machine-id machine-id})))

(defn create-user
  "Create a new user in the database"
  [user-id profile]
  (let [user {:user-id user-id :name (:displayName profile) :machines [] :files []}
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

(defn update-file
  [f file-id previous-revision user-id]
  file-id)

(defn create-file
  "Create a new file for a user, return the id"
  [f path user-id]
  (let [gridid (.toString (files/persist path f))
        revision (created-now (with-oid {:revision 1 :gridid gridid}))
        filename (files/path->filename path)
        file (with-oid {:path path :profiles [] :type  (files/extract-filetype filename) :revisions [revision]})
        conn (mg/connect)
        db   (mg/get-db conn (:db mongo-options))]
    (mc/find-and-modify db (:users-collection mongo-options) {:user-id user-id} {"$push" {:files file}} {})
    (.toString (:_id file))))
