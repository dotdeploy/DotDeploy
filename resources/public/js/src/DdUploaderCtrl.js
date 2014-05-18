'use strict';

var DEPENDENCIES = ['$scope', 'FileUpload'];

function UploadCtrl($scope, FileUpload) {
    this.upload = function() {
        FileUpload.upload($scope.files[0]);
    }.bind(this);
}

UploadCtrl.$inject = DEPENDENCIES;

module.exports = UploadCtrl;