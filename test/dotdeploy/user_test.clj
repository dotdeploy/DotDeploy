(ns dotdeploy.user-test
  (:require [clojure.test :refer :all]
            [monger.core :as mg]
            [monger.collection :as mc]
            [schema.core :refer [validate]]
            [dotdeploy.models :refer [User]]
            [dotdeploy.user :refer :all]))

(let [conn (mg/connect)
      db   (mg/get-db conn "monger-test")]
  (defn purge-collections
    [f]
    (mc/remove db "people")
    (mc/remove db "docs")
    (mc/remove db "things")
    (mc/remove db "widgets")
    (f)
    (mc/remove db "people")
    (mc/remove db "docs")
    (mc/remove db "things")
    (mc/remove db "widgets"))

  (use-fixtures :each purge-collections)

  (deftest test-create-user-valid-profile
    (with-redefs [dotdeploy.auth/get-user-profile (fn [_] {:name {:givenName "firstName" :familyName "lastName"}})]
      (let [user-id "12345"
            user    (get-or-create-user user-id)]
        (is (validate User user))
        (is (= user (get-user user-id)))
        (is (= "firstName lastName" (:name user)))
        (is (= user-id (:user-id user))))))

  (deftest test-create-user-invalid-profile
    (with-redefs [dotdeploy.auth/get-user-profile (fn [_] {:invalid true})]
      (is (thrown? Exception (get-or-create-user "12345"))))))
