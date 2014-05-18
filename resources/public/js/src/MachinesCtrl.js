'use strict';

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function MachinesCtrl($rootScope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.machines;
        this.selected = _.find(this.list, function(machine) {
            return machine['machine-id'] === $routeParams.machineId;
        });
    }.bind(this));

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