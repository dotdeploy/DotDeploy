(ns dotdeploy.data
  (:require [monger.core :as mg]
            [monger.collection :as mc]))

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
