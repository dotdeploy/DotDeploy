'use strict';

var DEPENDENCIES = ['$routeProvider'];

function Routes($routeProvider) {
    $routeProvider
        .when('/files', {
            templateUrl: 'files.html',
            controller: 'FilesCtrl as files'
        })
        .when('/files/:fileId', {
            templateUrl: 'file.html',
            controller: 'FilesCtrl as files'
        })
        .when('/machines', {
            templateUrl: 'machines.html',
            controller: 'MachinesCtrl as machines'
        })
        .when('/machines/:machineId', {
            templateUrl: 'machine.html',
            controller: 'MachinesCtrl as machines'
        })
        .when('/profiles', {
            templateUrl: 'profiles.html',
            controller: 'ProfilesCtrl as profiles'
        })
        .when('/profiles/:profileId', {
            templateUrl: 'profile.html',
            controller: 'ProfilesCtrl as profiles'
        })
        .when('/upload', {
            templateUrl: 'upload.html'
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