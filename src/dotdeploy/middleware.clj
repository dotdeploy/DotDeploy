(ns dotdeploy.middleware)

(defn wrap-dir-index [handler]
  "Ring middleware function that updates the request uri of the root to include
  index.html to properly map it to the homepage html file"
  (fn [req]
    (handler
      (update-in req [:uri]
                 #(if (= "/" %)
                   "/index.html"
                   %)))))
