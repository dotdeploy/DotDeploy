'use strict';

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function FilesCtrl($rootScope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.files;
        this.selected = _.find(this.list, function(file) {
            return file['file-id'] === $routeParams.fileId;
        });
    }.bind(this));
}

FilesCtrl.$inject = DEPENDENCIES;

module.exports = FilesCtrl;