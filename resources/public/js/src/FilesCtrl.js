'use strict';

var DEPENDENCIES = ['$scope', '$routeParams', 'User'];

function FilesCtrl($scope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.files;
        this.selected = _.find(this.list, function(file) {
            return file['file-id'] === $routeParams.fileId;
        });
    }.bind(this));

    this.editorOptions = {
        indentUnit: 4,
        lineNumbers: true,
        theme: 'solarized dark'
    };
}

FilesCtrl.$inject = DEPENDENCIES;

module.exports = FilesCtrl;