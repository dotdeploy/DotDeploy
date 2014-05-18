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
   :users-collection    "users"
   :files-collection    "files"})

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

;;;; File Metadata

(defn extract-filetype
  "Attempts to determine the type of this file based on the filename"
  [filename]
  (case filename
    ".bashrc"       :bashrc
    ".bash_profile" :bashrc
    ".bash_aliases" :bashrc
    ".aliases"      :bashrc
    ".zshrc"        :bashrc
    ".cshrc"        :bashrc
    ".login"        :bashrc
    ".vimrc"        :vimrc
    "tmux.conf"     :tmuxrc
    ".gitconfig"    :gitconfig
    ".profile"      :profile
    ".inputrc"      :inputrc
    ".dmrc"         :desktopmanagerrc
    ".screenrc"     :screenrc
    ".npmrc"        :noderc
    ".wgetrc"       :wgetrc
    ".emacs"        :emacs
    :unknown))
