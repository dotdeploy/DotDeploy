(ns dotdeploy.models
  (:require [schema.core :as s]
            [ring.swagger.schema :refer [defmodel]]))

(defmodel Token
  "A code which can be used to add a new machine to a user"
  {:token-id s/Str
   :created-on org.joda.time.DateTime
   (s/optional-key :uses) s/Int
   (s/optional-key :expires-on) org.joda.time.DateTime
   (s/optional-key :description) s/Str})

(defmodel NewToken
  "The required properties for creating a new token"
  (-> Token
      (dissoc :token-id)
      (dissoc :created-on)))

(defmodel Machine
  "A representation of a computer owned by a User"
  {:machine-id s/Str
   :active s/Bool
   :profiles [s/Str]
   :created-on org.joda.time.DateTime
   :last-checkin org.joda.time.DateTime
   :name s/Str
   :hostname s/Str
   (s/optional-key :description) s/Str})

(defmodel FileRevision
  "Metadata about a file at a particular point in time"
  {:created-on org.joda.time.DateTime
   :grid-id s/Str
   :sha256 s/Str
   :revision-id s/Str})

(defmodel File
  "Attributes about a file owned by a User"
  {:file-id s/Str
   :path s/Str
   :profiles [s/Str]
   :type s/Str
   :active s/Bool
   :revisions [FileRevision]
   :public s/Bool
   :shared-users [s/Str]
   (s/optional-key :forked-from) s/Str})

(defmodel User
  "Top level object representing a user, containing their Machines, Tokens, and Files"
  {:user-id s/Str
   :created-on org.joda.time.DateTime
   :name s/Str
   :machines [Machine]
   :files [File]
   :tokens [Token]})
