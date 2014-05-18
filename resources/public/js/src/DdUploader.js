'use strict';

var DEPENDENCIES = [];

function DdUploader() {
    return {
        templateUrl: 'DdUploader.html',
        replace: false,
        restrict: 'A',
        controller: 'DdUploaderCtrl as uploader',
        link: function(scope, element) {
            var $fileInput = element.find('input[type="file"]');
            $fileInput.bind('change', function(e) {
                var i;
                scope.notReady = e.target.files.length === 0;
                scope.files = [];
                for (i in e.target.files) {
                    if (typeof e.target.files[i] === 'object') {
                        scope.files.push(e.target.files[i]);
                    }
                }
            });
        }
    };
}

DdUploader.$inject = DEPENDENCIES;

module.exports = DdUploader;