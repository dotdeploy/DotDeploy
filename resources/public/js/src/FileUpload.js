'use strict';

var DEPENDENCIES = ['$http', 'User'];

function FileUploadFactory($http, User) {
    function FileUpload() {}

    FileUpload.prototype.upload = function(file) {
        var formData = new FormData();
        formData.append('file', file);
        formData.append('path', file.name);

        return $http({
            method: 'POST',
            url: '/api/site/file?access_token=' + User.auth.access_token,
            data: formData,
            headers: { 'Content-Type': 'text/plain' },
            transformRequest: angular.identity
        });
    };

    return new FileUpload();
}

FileUploadFactory.$inject = DEPENDENCIES;


module.exports = FileUploadFactory;