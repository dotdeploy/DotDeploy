'use strict';

var DEPENDENCIES = ['User'];

function ProfilesCtrl(User) {
    this.profiles = User.profiles;
}

ProfilesCtrl.$inject = DEPENDENCIES;

module.exports = ProfilesCtrl;