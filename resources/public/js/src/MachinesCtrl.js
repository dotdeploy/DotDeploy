'use strict';

var DEPENDENCIES = ['User'];

function MachinesCtrl(User) {
    this.machines = User.machines;
}

MachinesCtrl.$inject = DEPENDENCIES;

module.exports = MachinesCtrl;