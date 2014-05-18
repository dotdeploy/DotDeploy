'use strict';

var DEPENDENCIES = ['User'];

function FilesCtrl(User) {
    this.files = User.files;
}

FilesCtrl.$inject = DEPENDENCIES;

module.exports = FilesCtrl;