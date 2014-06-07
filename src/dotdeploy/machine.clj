(ns dotdeploy.machine
  (:require [dotdeploy.models :as model]
            [dotdeploy.user :as user]
            [dotdeploy.data :as data]
            [monger.collection :as mc]
            [schema.core :as s]))

(defn get-machines
  "Retrieve a list of all Machines for a User with a given user-id"
  [user-id]
  (if-let [user (user/get-user user-id)]
    (:machines user)
    []))
