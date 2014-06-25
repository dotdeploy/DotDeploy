(ns dotdeploy.gridfs
  (:require [clojure.string :as string]
            [monger.core :as mg]
            [monger.collection :as mc]
            [monger.gridfs :as gfs :refer [store-file
                                           make-input-file
                                           filename
                                           content-type
                                           metadata]]
            [dotdeploy.data :as data]
            [dotdeploy.models :as models]))

(defn- build-location
  "Create the string representing the path in GridFS to a file"
  [user-id file-id revision-id]
  (string/join "/" [user-id file-id revision-id]))

(defn persist
  "Persist a file to GridFS, returning the ObjectID of the new file"
  ([user-id file-id revision-id f] (persist user-id file-id revision-id f "text/plain"))
  ([user-id file-id revision-id f mime]
     (let [fs   (mg/get-gridfs (mg/connect) (:files-coll data/mongo-options))
           name (build-location user-id file-id revision-id)]
       (if (instance? String f)
         (persist user-id file-id revision-id (byte-array (map byte f)) mime)
         (.toString (:_id (gfs/store-file (make-input-file fs f)
                                          (filename name)
                                          (content-type mime))))))))

(defn retrieve
  "Retrieve a file from GridFS as an InputStream"
  [user-id file-id revision-id]
  (let [fs   (mg/get-gridfs (mg/connect) (:files-coll data/mongo-options))
        name (build-location user-id file-id revision-id)]
    (-> (gfs/find-one fs {:filename name})
        (.getInputStream))))

(defn retrieve-string
  "Retrieve a file from GridFS as a String"
  [user-id file-id revision-id]
  (slurp (retrieve user-id file-id revision-id)))
