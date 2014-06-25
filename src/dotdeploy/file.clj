(ns dotdeploy.file
  (:require [clj-time.core :as time]
            [monger.core :as mg]
            [monger.collection :as mc]
            [monger.result :refer [ok?]]
            [dotdeploy.gridfs :as gridfs]
            [dotdeploy.data :as data]
            [dotdeploy.user :as user]))

;;;; File Utilities

(defn path->filename
  "Get the name of the file from the full path"
  [path]
  (last (clojure.string/split path #"/")))

(defn filename->filetype
  "Attempts to determine the type of this file based on the filename"
  [filename]
  ; FIXME: This is the full path, not filename
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

;;;; File Manipulation

(defn get-files-meta
  "Retrieve a list of Files (metadata, not binary data) for a particular user-id"
  [user-id]
  (if-let [user (user/get-user user-id)]
    (:files user)))

(defn get-file-meta
  "Retrieve the File (metadata, not binary data) for the given file-id"
  [user-id file-id]
  (if-let [files (get-files-meta user-id)]
    (first (filter #(= file-id (:file-id %)) files))))

(defn get-latest-version
  "Retrieve the most recent FileRevision from a File"
  [file]
  (let [revisions (:revisions file)]
    (cond
     (empty? revisions) nil
     (= 1 (count revisions)) (first revisions)
     :else (first (sort-by :revision-id revisions)))))

(defn get-file-binary
  "Retrieve a file by version, or the latest if no version is specified.
   Will validate that the file is owned by the user-id provided"
  ([user-id file-id] (get-file-binary user-id file-id "latest"))
  ([user-id file-id version]
     ;; TODO: Finish this
     ))

(defn update-file
  "Upload a new FileRevision to an existing File"
  [])

(defn create-file
  "Create a new File for a User with given user-id and return the created File object"
  [user-id path sha256 content]
  (let [filename (path->filename path)
        file     {:file-id   (data/uuid)
                  :path      path
                  :profiles  []
                  :type      (filename->filetype filename)
                  :active    true
                  :public    false
                  :revisions [
                              {:created-on  (time/now)
                               :sha-256     sha256
                               :revision-id 1}]}]
    (gridfs/persist user-id (:file-id file) 1 content)
    ;; FIXME: Check that the file was persisted correctly
    (if (user/update-user user-id {"$push" {:files file}})
      file)))
