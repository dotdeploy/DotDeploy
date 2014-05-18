'use strict';

var DEPENDENCIES = ['$scope', '$http', 'User'];

function InstallCtrl($scope, $http, User) {
    User.init().then(function() {
        return $http.get('/api/site/token?access_token=' +
                         User.auth.access_token);
    }.bind(this)).then(function(response) {
        this.command = 'curl /static/lib/install.sh | bash -s ' + response.data;
    }.bind(this));

    this.editorOptions = {
        indentUnit: 4,
        theme: 'default',
        readOnly: true
    };
}

InstallCtrl.$inject = DEPENDENCIES;

module.exports = InstallCtrl;