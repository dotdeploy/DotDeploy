'use strict';

var DEPENDENCIES = ['$routeProvider'];

function Routes($routeProvider) {
    $routeProvider
        .when('/files/:fileId?', {
            templateUrl: 'files.html',
            controller: 'FilesCtrl as files'
        })
        .when('/machines/:machineId?', {
            templateUrl: 'machines.html',
            controller: 'MachinesCtrl as machines'
        })
        .when('/profiles/:profileId?', {
            templateUrl: 'profiles.html',
            controller: 'ProfilesCtrl as profiles'
        })
        .when('/install', {
            templateUrl: 'install.html',
            controller: 'InstallCtrl as install'
        })
        .otherwise({
            templateUrl: 'home.html'
        });
}

Routes.$inject = DEPENDENCIES;

module.exports = Routes;