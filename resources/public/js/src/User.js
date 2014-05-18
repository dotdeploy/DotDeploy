'use strict';

var DEPENDENCIES = ['$q', '$rootScope', '$http'];

function UserFactory($q, $rootScope, $http) {

    function User() {
        this.deferred = $q.defer();
        window.onSignInCallback = this.signedIn.bind(this);
    }

    User.prototype.init = function() {
        return this.deferred.promise;
    };

    User.prototype.signedIn = function(authResults) {
        if (authResults.error) {
            switch (authResults.error) {
            case 'user_signed_out':
                break;
            case 'immediate_failed':
                this.deferred.resolve();
                break;
            default:
                console.error(authResults.error);
            }
            return;
        }
        $rootScope.$apply(function() {
            gapi.client.load('plus','v1', function() {
                var request;

                this.auth = authResults;

                if (this.auth.status.signed_in) {
                    request = gapi.client.plus.people.get({'userId' : 'me'});
                    request.execute(function(profile) {
                        this.deferred.resolve();
                        this.profile = profile;
                        this.fetch();
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
    };

    User.prototype.fetch = function() {
        $http.get(_.sprintf('/api/site/user/%s?access_token=%s',
                            this.profile.id,
                            this.auth.access_token
        )).then(function(response) {
            this.extend(response.data);
        }.bind(this));
    };

    User.prototype.extend = function(user) {
        angular.extend(this, user);
    };

    User.prototype.logout = function() {
        gapi.auth.signOut();
        delete this.profile;
        delete this.auth;
    };

    return new User();
}

UserFactory.$inject = DEPENDENCIES;

module.exports = UserFactory;