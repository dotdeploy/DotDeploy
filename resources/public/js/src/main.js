'use strict';

window.bootstrap = function() {
    angular.bootstrap(document, ['dotdeploy']);
};

angular.module('dotdeploy', ['ngRoute'])
    .config(require('./Routes'))
    .run(require('./Run'))
    .service('Config', require('./Config.js'))
    .factory('User', require('./User.js'))
    .directive('ddHeader', require('./DdHeader.js'))
    .controller('HeaderCtrl', require('./HeaderCtrl'))
    .controller('FilesCtrl', require('./FilesCtrl'))
    .controller('MachinesCtrl', require('./MachinesCtrl'))
    .controller('ProfilesCtrl', require('./ProfilesCtrl'));