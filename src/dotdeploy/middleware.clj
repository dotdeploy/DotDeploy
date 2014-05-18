(ns dotdeploy.middleware
  (:require [dotdeploy.authentication :refer [authorize-google-code]]
            [ring.util.response :refer [response status]]
            [slingshot.slingshot :refer [try+ throw+]]
            [taoensso.timbre :refer [debug warn]]
            [clojure.walk :refer [keywordize-keys]]
            [clojure.string :refer [upper-case]]
            [clj-time.format :as format]
            [cheshire.generate :refer [add-encoder]])
  (:import (com.fasterxml.jackson.core JsonGenerator)))

;;
;; dakrone/cheshire JSON library extensions
;; See https://github.com/dakrone/cheshire
;;

(add-encoder java.lang.Exception
             (fn [^Exception e ^JsonGenerator jg]
               (.writeStartObject jg)
               (.writeFieldName jg "exception")
               (.writeString jg (.getName (class e)))
               (.writeFieldName jg "message")
               (.writeString jg (.getMessage e))
               (.writeEndObject jg)))

(add-encoder org.joda.time.DateTime
             (fn [^org.joda.time.DateTime dt ^JsonGenerator jg]
               (.writeString jg (format/unparse
                                  (format/formatters :date-time-no-ms) dt))))

(add-encoder org.bson.types.ObjectId
             (fn [^org.bson.types.ObjectId id ^JsonGenerator jg]
               (.writeString jg (.toString id))))

(defn wrap-dir-index [handler]
  "Ring middleware function that updates the request uri of the root to include
  index.html to properly map it to the homepage html file"
  (fn [req]
    (handler
      (update-in req [:uri]
                 #(if (= "/" %)
                   "/index.html"
                   %)))))

(defn wrap-request-logger
  "Ring middleware function that uses clojure.tools.logging to write a debug message
  containing remote address, request method & URI of incoming request"
  [handler]
  (fn [req]
    (let [{remote-addr :remote-addr request-method :request-method uri :uri} req]
      (debug remote-addr (upper-case (name request-method)) uri)
      (handler req))))

(defn wrap-response-logger
  "Ring middleware function that uses clojure.tools.logging to write a debug message
  containing remote address, request method, URI & response status of outgoing response"
  [handler]
  (fn [req]
    (let [response (handler req)
          {remote-addr :remote-addr request-method :request-method uri :uri} req
          {status :status body :body} response]
      (if (instance? Exception body)
        (warn body remote-addr (upper-case (name request-method)) uri "->" status body)
        (debug remote-addr (upper-case (name request-method)) uri "->" status))
      response)))

(defn wrap-authentication-handler
  "Ring middleware function which authenticates a request, looking for an access token.
  Validates the user, associating a user-id to the body if the request was a POST or PUT,
  otherwise adding to the query-params."
  [handler]
  (fn [req]
    (let [params (keywordize-keys (req :query-params))
          access_token (:access_token params)
          method (req :request-method)]
      (if (nil? access_token)
        (throw+ {:type ::missing_token} "Access token does not exist"))
      (handler (assoc-in req [:query-params :user-id ] ((authorize-google-code access_token) :user-id))))))

(defn wrap-exception-handler
  "Ring middleware function to trap any uncaught exceptions and return an appropriate
  status code with the exception instance as the response body"
  [handler]
  (fn [req]
    (try+
      (handler req)
      (catch [:type :brewrecipe.data/invalid] _
        (->
          (response (&throw-context :message))
          (status 400)))
      (catch [:type :brewrecipe.authentication/invalid_token] _
        (->
          (response (&throw-context :message))
          (status 401)))
      (catch [:type :brewrecipe.middleware/missing_token] _
        (->
          (response (&throw-context :message))
          (status 401)))
      (catch [:type :brewrecipe.data/not-found] _
        (->
          (response (&throw-context :message))
          (status 404)))
      (catch Object _
        (->
          (response (&throw-context :message))
          (status 500))))))
