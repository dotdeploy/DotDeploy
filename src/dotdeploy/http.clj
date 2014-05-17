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
