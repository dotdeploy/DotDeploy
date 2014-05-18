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
  "Add a new Object ID to a map"
  [object]
  (assoc object :_id (util/object-id)))

(defn created-now
  "Set the created time key to the current time"
  [object]
  (assoc object :created (time/now)))

(defn check-in
  "Set the last-checkin to the current time"
  [object]
  (assoc object :last-checkin (time/now)))

;;;; Database manipuation functions

(defn build-profiles
  "Create a profiles section in the User for convenience purposes"
  [user]
  (let [machine-profiles (set (flatten (map :profiles (:machines user))))
        files-profiles (set (flatten (map :profiles (:files user))))]
    (assoc user :profiles (clojure.set/union machine-profiles files-profiles))))

(defn get-user
  "Retrieve a User from the database by id, or nil if it doesn't exist"
  [user-id]
  (let [conn (mg/connect)
        db   (mg/get-db conn (:db mongo-options))]
    (mc/find-one-as-map db (:users-collection mongo-options) {:user-id user-id})))

(defn machine->user
  "Retrieve a User from the database by machine-id"
  [machine-id]
  (let [conn (mg/connect)
        db (mg/get-db conn (:db mongo-options))]
    (mc/find-one-as-map db (:users-collection mongo-options) {:machines.machine-id machine-id})))

(defn token->user
  "Retrieve the user associated with a token, decrement the number of usages left on that token"
  [token]
  ; TODO: Decrement the number of usages left on the token
  ; TODO: Invalidate/remove tokens that have expired

  (let [conn (mg/connect)
        db (mg/get-db conn (:db mongo-options))]
    (mc/find-one-as-map db (:users-collection mongo-options {:tokens.token token}))))

(defn create-user
  "Create a new user in the database"
  [user-id profile]
  (let [user {:user-id user-id :name (:displayName profile) :machines [] :files [] :tokens []}
        new-user (created-now (with-oid user))
        conn (mg/connect)
        db   (mg/get-db conn (:db mongo-options))]
    (if (ok? (mc/insert db (:users-collection mongo-options) new-user))
      new-user
      (throw+ {:type ::failed} "Create user failed"))))

(defn create-machine
  "Create a new machine for a user"
  [token machine-id hostname]
  (let [user (token->user token)
        machine (check-in (created-now (with-oid {:machine-id machine-id :hostname hostname :active true :profiles []})))
        conn (mg/connect)
        db (mg/get-db conn (:db mongo-options))]
    ; TODO: Add the profiles from the token to this machine
    (ok? (mc/find-and-modify db (:users-collection mongo-options) {:user-id user} {"$push" {:machines machine}} {}))))

(defn create-token
  "Create a new token which can be used to register a new machine"
  [user-id token]
  (let [conn (mg/connect)
        db (mg/get-db conn (:db mongo-options))
    (ok? (mc/find-and-modify db (:users-collection mongo-options) {:user-id user-id} {"$push" {:tokens token}} {})])))

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
