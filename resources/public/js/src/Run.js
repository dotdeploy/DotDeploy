'use strict';

var DEPENDENCIES = ['$http'];

function Run($http) {
    $http.defaults.headers.get = {
        'Content-Type': 'application/json'
    };
}

Run.$inject = DEPENDENCIES;

module.exports = Run;