'use strict';

window.bootstrap = function() {
    angular.bootstrap(document, ['dotdeploy']);
};

angular.module('dotdeploy', ['ngRoute', 'ui.codemirror'])
    .config(require('./Routes'))
    .run(require('./Run'))
    .service('Config', require('./Config'))
    .factory('FileUpload', require('./FileUpload'))
    .factory('User', require('./User'))
    .directive('ddHeader', require('./DdHeader'))
    .directive('ddUploader', require('./DdUploader'))
    .controller('DdUploaderCtrl', require('./DdUploaderCtrl'))
    .controller('InstallCtrl', require('./InstallCtrl'))
    .controller('HeaderCtrl', require('./HeaderCtrl'))
    .controller('FilesCtrl', require('./FilesCtrl'))
    .controller('MachinesCtrl', require('./MachinesCtrl'))
    .controller('ProfilesCtrl', require('./ProfilesCtrl'));