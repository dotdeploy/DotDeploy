'use strict';

var DEPENDENCIES = ['$http', '$scope', '$routeParams', 'User'];

function MachinesCtrl($http, $scope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.machines;
        this.selected = _.find(this.list, function(machine) {
            return machine['machine-id'] === $routeParams.machineId;
        });
        this.profiles = {};
        angular.forEach(User.profiles, function(profile) {
            this.profiles[profile] = false;
        }, this);
        angular.forEach(User.machines.profiles, function(profile) {
            this.profiles[profile] = true;
        }, this);
    }.bind(this));

    this.saveSelected = function() {
        var profiles = [];
        angular.forEach(this.profiles, function(isEnabled, profile) {
            if (isEnabled) {
                profiles.push(profile);
            }
        });
        $http({
            method: 'PATCH',
            url: _.sprintf('/api/site/user/%s/machine/%s?access_token=%s',
                           User._id,
                           this.selected['machine-id'],
                           User.auth.access_token),
            data: {
                'machine.$.name': this.selected.name,
                'machine.$.profiles': profiles
            },
            headers: {
                'Content-Type': 'text/plain',
                'X-Path': this.path,
                'X-File-Id': this.selected['file-id'],
                'X-Previous-Revision': this.selected['revision-id']
            },
            transformRequest: angular.identity
        }).then(User.fetch);
    };


    this.getSelectedName = function() {
        if (!this.selected) {
            return 'Loading...';
        }
        return (this.selected.name || '') +
               _.sprintf((this.selected.name ? ' (%s)' : '%s'),
                         this.selected.hostname);
    };
}

MachinesCtrl.$inject = DEPENDENCIES;

module.exports = MachinesCtrl;