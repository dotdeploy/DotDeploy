(defproject dotdeploy "0.1.0-SNAPSHOT"
  :description "Synchronize dotfiles on all your computers"
  :url "http://dotdeploy.works"
  :license {:name "Apache 2 License"
            :url "http://www.apache.org/licenses"}
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [compojure "1.1.8"]
                 [ring-middleware-format "0.3.2"]
                 [ring/ring-json "0.3.1"]
                 [com.taoensso/timbre "3.2.1"]
                 [com.novemberain/monger "2.0.0-rc1"]
                 [com.novemberain/validateur "2.1.0"]
                 [slingshot "0.10.3"]
                 [clj-http "0.9.1"]
                 [uri "1.1.0"]
                 [org.clojure/data.json "0.2.4"]]
  :plugins [[lein-ring "0.8.7"]]
  :ring {:handler dotdeploy.handler/app}
  :profiles
  {:dev
    {:dependencies [[ring-mock "0.1.5"]]}})
