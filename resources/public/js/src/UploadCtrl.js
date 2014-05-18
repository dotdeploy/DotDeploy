'use strict';

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function ProfilesCtrl($rootScope, $routeParams, User) {
    this.list = User.profiles;
    $rootScope.$watch(function() { return $routeParams.fileId; }, function(id) {
        this.selected = _.find(this.list, function(f) {return f.id === id; });
    }.bind(this));
}

ProfilesCtrl.$inject = DEPENDENCIES;

module.exports = ProfilesCtrl;