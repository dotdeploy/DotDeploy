(ns dotdeploy.http
  (:require [ring.util.response :refer [response status]]
            [ring.mock.request :refer [header]]
            [clojure.string :refer [join upper-case]]))

(defn options
  "Generate a 200 HTTP response with an Allow header containing the provided
  HTTP method names - response for an HTTP OPTIONS request"
  ([] (options #{:options} nil))
  ([allowed] (options allowed nil))
  ([allowed body]
   (->
     (response body)
     (header "Allow" (join ", " (map (comp upper-case name) allowed))))))

(defn method-not-allowed
  "Generate a 405 response with an Allow header containing the provided HTTP
  method names"
  [allowed]
  (->
    (options allowed)
    (status 405)))

(defn not-implemented
  "Return an HTTP 501 (Not Implemented)"
  []
  (->
    (response nil)
    (status 501)))

(defn created
  "Return an HTTP 201 (Created)"
  ([url]
   (created url nil))
  ([url body]
   (->
     (response body)
     (status 201)
     (header "Location" url))))

(defn conflict
  "Return an HTTP 409 (Conflict)"
  []
  (->
    (response nil)
    (status 409)))

(defn ok
  "Return an HTTP 200 (OK)"
  [body]
  (->
    (response body)
    (status 200)))
