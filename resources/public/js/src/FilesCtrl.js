'use strict';

var DEPENDENCIES = ['$http', '$scope', '$routeParams', 'User'];

function FilesCtrl($http, $scope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.files;
        this.selected = _.find(this.list, function(file) {
            return file['file-id'] === $routeParams.fileId;
        });
    }.bind(this));

    this.save = function() {
        $http({
            method: 'PATCH',
            url: '/api/site/file?access_token=' + User.auth.access_token,
            data: this.fileContents,
            headers: {
                'Content-Type': 'text/plain',
                'X-Path': this.path,
                'X-File-Id': this.selected['file-id'],
                'X-Previous-Revision': this.selected['revision-id']
            },
            transformRequest: angular.identity
        }).then(User.fetch);
    };

    this.upload = function() {
        $http({
            method: 'POST',
            url: '/api/site/file?access_token=' + User.auth.access_token,
            data: this.fileContents,
            headers: {
                'Content-Type': 'text/plain',
                'X-Path': this.selected.path
            },
            transformRequest: angular.identity
        }).then(User.fetch);
    };

    this.editorOptions = {
        indentUnit: 4,
        lineNumbers: true,
        theme: 'solarized dark'
    };
}

FilesCtrl.$inject = DEPENDENCIES;

module.exports = FilesCtrl;