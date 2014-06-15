(ns dotdeploy.machine
  (:require [dotdeploy.models :as models]
            [dotdeploy.user :as user]
            [dotdeploy.data :as data]
            [dotdeploy.token :as token]
            [monger.collection :as mc]
            [schema.core :as s]
            [clj-time.core :as time]))

(defn get-machines
  "Retrieve a list of all Machines for a User with a given user-id"
  [user-id]
  (if-let [user (user/get-user user-id)]
    (:machines user)
    []))

(defn create-machine
  "Create and return a new machine using the given token-id"
  [machine-id hostname token-id]
  ;; FIXME: Ensure that the machine-id is unique
  (if-let [auth-token (token/get-token token-id)]
    (if (token/valid? auth-token)
      (let [{:keys [description user]} (token/use-token token-id)
            new-machine {:machine-id   machine-id
                         :active       true
                         :profiles     []
                         :created-on   (time/now)
                         :last-checkin (time/now)
                         :hostname     hostname
                         :name         hostname
                         :description  description}]
        (if (user/update-user (:user-id user) {"$push" {:machines (s/validate models/Machine new-machine)}})
          new-machine
          (throw (Exception. "Unable to create new machine"))))
      (throw (Exception. "Token is not valid")))
    (throw (Exception. "Token with this ID does not exist"))))

(defn delete-machine
  "Marks a Machine as inactive then returns the result of get-machines"
  [machine-id user-id]
  (if (data/update {:machines.machine-id machine-id}
                   {"$set" {:machines.$.active false}})
    (get-machines user-id)))
