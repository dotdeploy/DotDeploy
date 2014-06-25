(ns dotdeploy.data
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [monger.result :refer [ok?]]))

(def mongo-options
  {:db         "dotdeploy"
   :users-coll "users"
   :files-coll "files"})

(defn get-db
  "Retrieve an active DB connection through Monger"
  []
  (mg/get-db (mg/connect) (:db mongo-options)))

(defn update
  "A shortcut for updating a document in the users collection"
  ([query updates] (update query updates false))
  ([query updates upsert]
     (ok? (mc/update (get-db)
                     (:users-coll mongo-options)
                     query
                     updates
                     {:upsert upsert}))))

;; Ensure that the collections exist
(let [db (get-db)]
  (if-not (mc/exists? db (:users-coll mongo-options))
    (mc/create db (:users-coll mongo-options) {:capped false})))

;;;; Somewhat General Utilities

(defn uuid
  "Generate a random UUID using the built in Java library"
  []
  (str (java.util.UUID/randomUUID)))
