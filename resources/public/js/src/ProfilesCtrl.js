'use strict';

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function ProfilesCtrl($rootScope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.profiles;
        this.selected = _.find(this.list, function(profile) {
            return profile['profile-id'] === $routeParams.profileId;
        });
    }.bind(this));
}

ProfilesCtrl.$inject = DEPENDENCIES;

module.exports = ProfilesCtrl;