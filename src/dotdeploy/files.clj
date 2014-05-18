(ns dotdeploy.files
  (:require [clj-time.core :as time]
            [monger.core :as mg]
            [monger.collection :as mc]
            [monger.util :as util]
            [monger.joda-time]
            [monger.gridfs :as gfs :refer [store-file
                                           make-input-file
                                           filename
                                           content-type
                                           metadata]]
            [slingshot.slingshot :refer [throw+]]
            [validateur.validation :refer [presence-of format-of valid?
                                           validation-set]]))

;;;; MongoDB Connection

(def mongo-options
  {:db                  "dotdeploy"
   :machines-collection "machines"
   :users-collection    "users"
   :files-collection    "files"})

;;;; Utility Functions

(defn with-oid
  "Add a new Object ID to a Recipe"
  [recipe]
  (assoc recipe :_id (util/object-id)))

(defn created-now
  "Set the created time in a Recipe to the current time"
  [recipe]
  (assoc recipe :created (time/now)))

(defn modified-now
  "Set the modified time in a Recipe to the current time"
  [recipe]
  (assoc recipe :modified (time/now)))


;;;; GridFS Manipulation

(defn persist
  "Persist a file to GridFS, returns the ObjectId of the new file."
  ([name f] (persist name f "text/plain"))
  ([name f mime]
    (let [conn (mg/connect)
          fs   (mg/get-gridfs conn (:files-collection mongo-options))]
      (if (instance? String f)
        (persist name (byte-array (map byte f)) mime)
        (gfs/store-file (make-input-file fs f)
                        (filename name)
                        (content-type mime))))))

(defn retrieve
  "Retrieve a file from GridFS as an InputStream"
  [name]
  (let [conn (mg/connect)
        fs   (mg/get-gridfs conn (:files-collection mongo-options))]
    (-> (gfs/find-one fs {:filename name})
        (.getInputStream))))

(defn retrieve-string
  "Retrieve a file from GridFS as a String"
  [name]
  (slurp (retrieve name)))
