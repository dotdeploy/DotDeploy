'use strict';

var DEPENDENCIES = ['$http', '$location', '$rootScope', 'User'];

function Run($http, $location, $rootScope, User) {
    $http.defaults.headers.get = {
        'Content-Type': 'application/json'
    };

    $rootScope.$on('$routeChangeStart', function(event, next) {
        User.init().then(function() {
            if (!User.profile &&
                next.templateUrl !== 'home.html') {
                $location.path('/');
            }
        });
    });
}

Run.$inject = DEPENDENCIES;

module.exports = Run;