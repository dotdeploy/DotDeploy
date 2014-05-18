(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function Config() {}

Config.prototype.GPLUS = {
    CLIENT_ID: '944203012148-j0oc67d3hn40j3qoqq2vk7joo6f0jju4' +
               '.apps.googleusercontent.com',
    SCOPE: 'profile',
    ACCESS_TYPE: 'offline',
    THEME: 'dark',
    COOKIE_POLICY: 'single_host_origin'
};

Config.prototype.TYPES = [
    '.bashrc',
    '.bash_profile',
    '.bash_aliases',
    '.aliases',
    '.zshrc',
    '.cshrc',
    '.login',
    '.vimrc',
    '.tmux.conf',
    '.gitconfig',
    '.profile',
    '.inputrc',
    '.dmrc',
    '.screenrc',
    '.npmrc',
    '.wgetrc',
    '.emacs'
];

module.exports = Config;
},{}],2:[function(require,module,exports){
'use strict';

var DEPENDENCIES = [];

function DdHeader() {
    return {
        templateUrl: 'header.html',
        replace: true,
        restrict: 'E',
        controller: 'HeaderCtrl as header'
    };
}

DdHeader.$inject = DEPENDENCIES;

module.exports = DdHeader;
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$scope', 'FileUpload'];

function UploadCtrl($scope, FileUpload) {
    this.upload = function() {
        FileUpload.upload($scope.files[0]);
    }.bind(this);
}

UploadCtrl.$inject = DEPENDENCIES;

module.exports = UploadCtrl;
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$scope', '$routeParams', 'User'];

function FilesCtrl($scope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.files;
        this.selected = _.find(this.list, function(file) {
            return file['file-id'] === $routeParams.fileId;
        });
    }.bind(this));

    this.editorOptions = {
        indentUnit: 4,
        lineNumbers: true,
        theme: 'solarized dark'
    };
}

FilesCtrl.$inject = DEPENDENCIES;

module.exports = FilesCtrl;
},{}],7:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$route', '$scope', 'Config', 'User'];

function HeaderCtrl($route, $scope, Config, User) {
    $scope.user = User;
    $scope.$route = $route;

    gapi.signin.render('login-gplus', {
        'callback': User.signedIn.bind(User),
        'clientid': Config.GPLUS.CLIENT_ID,
        'scope': Config.GPLUS.SCOPE,
        'theme': Config.GPLUS.THEME,
        'cookiepolicy': Config.GPLUS.COOKIE_POLICY,
        'accesstype': Config.GPLUS.ACCESS_TYPE
    });
}

HeaderCtrl.$inject = DEPENDENCIES;

module.exports = HeaderCtrl;
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function MachinesCtrl($rootScope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.machines;
        this.selected = _.find(this.list, function(machine) {
            return machine['machine-id'] === $routeParams.machineId;
        });
    }.bind(this));

    this.getSelectedName = function() {
        if (!this.selected) {
            return 'Loading...';
        }
        return (this.selected.name || '') +
               _.sprintf((this.selected.name ? ' (%s)' : '%s'),
                         this.selected.hostname);
    };
}

MachinesCtrl.$inject = DEPENDENCIES;

module.exports = MachinesCtrl;
},{}],10:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function ProfilesCtrl($rootScope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.profiles;
        this.selected = _.find(this.list, function(profile) {
            return profile['profile-id'] === $routeParams.profileId;
        });
    }.bind(this));
}

ProfilesCtrl.$inject = DEPENDENCIES;

module.exports = ProfilesCtrl;
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$q', '$rootScope', '$http'];

function UserFactory($q, $rootScope, $http) {

    function User() {
        this.deferred = $q.defer();
        window.onSignInCallback = this.signedIn.bind(this);
    }

    User.prototype.init = function() {
        return this.deferred.promise;
    };

    User.prototype.signedIn = function(authResults) {
        if (authResults.error) {
            switch (authResults.error) {
            case 'user_signed_out':
                break;
            case 'immediate_failed':
                this.deferred.resolve();
                break;
            default:
                console.error(authResults.error);
            }
            return;
        }
        $rootScope.$apply(function() {
            gapi.client.load('plus','v1', function() {
                var request;

                this.auth = authResults;

                if (this.auth.status.signed_in) {
                    request = gapi.client.plus.people.get({'userId' : 'me'});
                    request.execute(function(profile) {
                        this.profile = profile;
                        this.fetch();
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
    };

    User.prototype.fetch = function() {
        $http.get(_.sprintf('/api/site/user/%s?access_token=%s',
                            this.profile.id,
                            this.auth.access_token
        )).then(function(response) {
            this.extend(response.data);
            this.deferred.resolve();
        }.bind(this));
    };

    User.prototype.extend = function(user) {
        angular.extend(this, user);
    };

    User.prototype.logout = function() {
        gapi.auth.signOut();
        delete this.profile;
        delete this.auth;
    };

    return new User();
}

UserFactory.$inject = DEPENDENCIES;

module.exports = UserFactory;
},{}],14:[function(require,module,exports){
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
},{"./Config":1,"./DdHeader":2,"./DdUploader":3,"./DdUploaderCtrl":4,"./FileUpload":5,"./FilesCtrl":6,"./HeaderCtrl":7,"./InstallCtrl":8,"./MachinesCtrl":9,"./ProfilesCtrl":10,"./Routes":11,"./Run":12,"./User":13}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFuc2VsXFxEb2N1bWVudHNcXEdpdEh1YlxcRG90RGVwbG95XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0NvbmZpZy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0RkSGVhZGVyLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvRGRVcGxvYWRlci5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0RkVXBsb2FkZXJDdHJsLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvRmlsZVVwbG9hZC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0ZpbGVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0hlYWRlckN0cmwuanMiLCJDOi9Vc2Vycy9BbnNlbC9Eb2N1bWVudHMvR2l0SHViL0RvdERlcGxveS9yZXNvdXJjZXMvcHVibGljL2pzL3NyYy9JbnN0YWxsQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL01hY2hpbmVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1Byb2ZpbGVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1JvdXRlcy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1J1bi5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1VzZXIuanMiLCJDOi9Vc2Vycy9BbnNlbC9Eb2N1bWVudHMvR2l0SHViL0RvdERlcGxveS9yZXNvdXJjZXMvcHVibGljL2pzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmZ1bmN0aW9uIENvbmZpZygpIHt9XHJcblxyXG5Db25maWcucHJvdG90eXBlLkdQTFVTID0ge1xyXG4gICAgQ0xJRU5UX0lEOiAnOTQ0MjAzMDEyMTQ4LWowb2M2N2QzaG40MGozcW9xcTJ2azdqb282ZjBqanU0JyArXHJcbiAgICAgICAgICAgICAgICcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxyXG4gICAgU0NPUEU6ICdwcm9maWxlJyxcclxuICAgIEFDQ0VTU19UWVBFOiAnb2ZmbGluZScsXHJcbiAgICBUSEVNRTogJ2RhcmsnLFxyXG4gICAgQ09PS0lFX1BPTElDWTogJ3NpbmdsZV9ob3N0X29yaWdpbidcclxufTtcclxuXHJcbkNvbmZpZy5wcm90b3R5cGUuVFlQRVMgPSBbXHJcbiAgICAnLmJhc2hyYycsXHJcbiAgICAnLmJhc2hfcHJvZmlsZScsXHJcbiAgICAnLmJhc2hfYWxpYXNlcycsXHJcbiAgICAnLmFsaWFzZXMnLFxyXG4gICAgJy56c2hyYycsXHJcbiAgICAnLmNzaHJjJyxcclxuICAgICcubG9naW4nLFxyXG4gICAgJy52aW1yYycsXHJcbiAgICAnLnRtdXguY29uZicsXHJcbiAgICAnLmdpdGNvbmZpZycsXHJcbiAgICAnLnByb2ZpbGUnLFxyXG4gICAgJy5pbnB1dHJjJyxcclxuICAgICcuZG1yYycsXHJcbiAgICAnLnNjcmVlbnJjJyxcclxuICAgICcubnBtcmMnLFxyXG4gICAgJy53Z2V0cmMnLFxyXG4gICAgJy5lbWFjcydcclxuXTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIERkSGVhZGVyKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2hlYWRlci5odG1sJyxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0hlYWRlckN0cmwgYXMgaGVhZGVyJ1xyXG4gICAgfTtcclxufVxyXG5cclxuRGRIZWFkZXIuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGRIZWFkZXI7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFtdO1xyXG5cclxuZnVuY3Rpb24gRGRVcGxvYWRlcigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdEZFVwbG9hZGVyLmh0bWwnLFxyXG4gICAgICAgIHJlcGxhY2U6IGZhbHNlLFxyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0RkVXBsb2FkZXJDdHJsIGFzIHVwbG9hZGVyJyxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgJGZpbGVJbnB1dCA9IGVsZW1lbnQuZmluZCgnaW5wdXRbdHlwZT1cImZpbGVcIl0nKTtcclxuICAgICAgICAgICAgJGZpbGVJbnB1dC5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLm5vdFJlYWR5ID0gZS50YXJnZXQuZmlsZXMubGVuZ3RoID09PSAwO1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuZmlsZXMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAoaSBpbiBlLnRhcmdldC5maWxlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZS50YXJnZXQuZmlsZXNbaV0gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmZpbGVzLnB1c2goZS50YXJnZXQuZmlsZXNbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuRGRVcGxvYWRlci4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZFVwbG9hZGVyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRzY29wZScsICdGaWxlVXBsb2FkJ107XHJcblxyXG5mdW5jdGlvbiBVcGxvYWRDdHJsKCRzY29wZSwgRmlsZVVwbG9hZCkge1xyXG4gICAgdGhpcy51cGxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBGaWxlVXBsb2FkLnVwbG9hZCgkc2NvcGUuZmlsZXNbMF0pO1xyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG59XHJcblxyXG5VcGxvYWRDdHJsLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVwbG9hZEN0cmw7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJGh0dHAnLCAnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gRmlsZVVwbG9hZEZhY3RvcnkoJGh0dHAsIFVzZXIpIHtcclxuICAgIGZ1bmN0aW9uIEZpbGVVcGxvYWQoKSB7fVxyXG5cclxuICAgIEZpbGVVcGxvYWQucHJvdG90eXBlLnVwbG9hZCA9IGZ1bmN0aW9uKGZpbGUpIHtcclxuICAgICAgICB2YXIgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcclxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3BhdGgnLCBmaWxlLm5hbWUpO1xyXG5cclxuICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9zaXRlL2ZpbGU/YWNjZXNzX3Rva2VuPScgKyBVc2VyLmF1dGguYWNjZXNzX3Rva2VuLFxyXG4gICAgICAgICAgICBkYXRhOiBmb3JtRGF0YSxcclxuICAgICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nIH0sXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHlcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG5ldyBGaWxlVXBsb2FkKCk7XHJcbn1cclxuXHJcbkZpbGVVcGxvYWRGYWN0b3J5LiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVXBsb2FkRmFjdG9yeTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckc2NvcGUnLCAnJHJvdXRlUGFyYW1zJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIEZpbGVzQ3RybCgkc2NvcGUsICRyb3V0ZVBhcmFtcywgVXNlcikge1xyXG4gICAgVXNlci5pbml0KCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBVc2VyLmZpbGVzO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBfLmZpbmQodGhpcy5saXN0LCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaWxlWydmaWxlLWlkJ10gPT09ICRyb3V0ZVBhcmFtcy5maWxlSWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuZWRpdG9yT3B0aW9ucyA9IHtcclxuICAgICAgICBpbmRlbnRVbml0OiA0LFxyXG4gICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxyXG4gICAgICAgIHRoZW1lOiAnc29sYXJpemVkIGRhcmsnXHJcbiAgICB9O1xyXG59XHJcblxyXG5GaWxlc0N0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZXNDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb3V0ZScsICckc2NvcGUnLCAnQ29uZmlnJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlckN0cmwoJHJvdXRlLCAkc2NvcGUsIENvbmZpZywgVXNlcikge1xyXG4gICAgJHNjb3BlLnVzZXIgPSBVc2VyO1xyXG4gICAgJHNjb3BlLiRyb3V0ZSA9ICRyb3V0ZTtcclxuXHJcbiAgICBnYXBpLnNpZ25pbi5yZW5kZXIoJ2xvZ2luLWdwbHVzJywge1xyXG4gICAgICAgICdjYWxsYmFjayc6IFVzZXIuc2lnbmVkSW4uYmluZChVc2VyKSxcclxuICAgICAgICAnY2xpZW50aWQnOiBDb25maWcuR1BMVVMuQ0xJRU5UX0lELFxyXG4gICAgICAgICdzY29wZSc6IENvbmZpZy5HUExVUy5TQ09QRSxcclxuICAgICAgICAndGhlbWUnOiBDb25maWcuR1BMVVMuVEhFTUUsXHJcbiAgICAgICAgJ2Nvb2tpZXBvbGljeSc6IENvbmZpZy5HUExVUy5DT09LSUVfUE9MSUNZLFxyXG4gICAgICAgICdhY2Nlc3N0eXBlJzogQ29uZmlnLkdQTFVTLkFDQ0VTU19UWVBFXHJcbiAgICB9KTtcclxufVxyXG5cclxuSGVhZGVyQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRzY29wZScsICckaHR0cCcsICdVc2VyJ107XHJcblxyXG5mdW5jdGlvbiBJbnN0YWxsQ3RybCgkc2NvcGUsICRodHRwLCBVc2VyKSB7XHJcbiAgICBVc2VyLmluaXQoKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc2l0ZS90b2tlbj9hY2Nlc3NfdG9rZW49JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBVc2VyLmF1dGguYWNjZXNzX3Rva2VuKTtcclxuICAgIH0uYmluZCh0aGlzKSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9ICdjdXJsIC9zdGF0aWMvbGliL2luc3RhbGwuc2ggfCBiYXNoIC1zICcgKyByZXNwb25zZS5kYXRhO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmVkaXRvck9wdGlvbnMgPSB7XHJcbiAgICAgICAgaW5kZW50VW5pdDogNCxcclxuICAgICAgICB0aGVtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgIHJlYWRPbmx5OiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG5JbnN0YWxsQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnN0YWxsQ3RybDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckcm9vdFNjb3BlJywgJyRyb3V0ZVBhcmFtcycsICdVc2VyJ107XHJcblxyXG5mdW5jdGlvbiBNYWNoaW5lc0N0cmwoJHJvb3RTY29wZSwgJHJvdXRlUGFyYW1zLCBVc2VyKSB7XHJcbiAgICBVc2VyLmluaXQoKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdCA9IFVzZXIubWFjaGluZXM7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IF8uZmluZCh0aGlzLmxpc3QsIGZ1bmN0aW9uKG1hY2hpbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hY2hpbmVbJ21hY2hpbmUtaWQnXSA9PT0gJHJvdXRlUGFyYW1zLm1hY2hpbmVJZDtcclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdGhpcy5nZXRTZWxlY3RlZE5hbWUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdMb2FkaW5nLi4uJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnNlbGVjdGVkLm5hbWUgfHwgJycpICtcclxuICAgICAgICAgICAgICAgXy5zcHJpbnRmKCh0aGlzLnNlbGVjdGVkLm5hbWUgPyAnICglcyknIDogJyVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLmhvc3RuYW1lKTtcclxuICAgIH07XHJcbn1cclxuXHJcbk1hY2hpbmVzQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYWNoaW5lc0N0cmw7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJHJvb3RTY29wZScsICckcm91dGVQYXJhbXMnLCAnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gUHJvZmlsZXNDdHJsKCRyb290U2NvcGUsICRyb3V0ZVBhcmFtcywgVXNlcikge1xyXG4gICAgVXNlci5pbml0KCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBVc2VyLnByb2ZpbGVzO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBfLmZpbmQodGhpcy5saXN0LCBmdW5jdGlvbihwcm9maWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9maWxlWydwcm9maWxlLWlkJ10gPT09ICRyb3V0ZVBhcmFtcy5wcm9maWxlSWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5Qcm9maWxlc0N0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvZmlsZXNDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb3V0ZVByb3ZpZGVyJ107XHJcblxyXG5mdW5jdGlvbiBSb3V0ZXMoJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgLndoZW4oJy9maWxlcycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdmaWxlcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0ZpbGVzQ3RybCBhcyBmaWxlcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvZmlsZXMvOmZpbGVJZCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdmaWxlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRmlsZXNDdHJsIGFzIGZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9tYWNoaW5lcycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtYWNoaW5lcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ01hY2hpbmVzQ3RybCBhcyBtYWNoaW5lcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvbWFjaGluZXMvOm1hY2hpbmVJZCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtYWNoaW5lLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnTWFjaGluZXNDdHJsIGFzIG1hY2hpbmVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9wcm9maWxlcycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVzQ3RybCBhcyBwcm9maWxlcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvcHJvZmlsZXMvOnByb2ZpbGVJZCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZXNDdHJsIGFzIHByb2ZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy91cGxvYWQnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndXBsb2FkLmh0bWwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2luc3RhbGwnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaW5zdGFsbC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0luc3RhbGxDdHJsIGFzIGluc3RhbGwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub3RoZXJ3aXNlKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdob21lLmh0bWwnXHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcblJvdXRlcy4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXM7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJGh0dHAnLCAnJGxvY2F0aW9uJywgJyRyb290U2NvcGUnLCAnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gUnVuKCRodHRwLCAkbG9jYXRpb24sICRyb290U2NvcGUsIFVzZXIpIHtcclxuICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuZ2V0ID0ge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcclxuICAgIH07XHJcblxyXG4gICAgJHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIG5leHQpIHtcclxuICAgICAgICBVc2VyLmluaXQoKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoIVVzZXIucHJvZmlsZSAmJlxyXG4gICAgICAgICAgICAgICAgbmV4dC50ZW1wbGF0ZVVybCAhPT0gJ2hvbWUuaHRtbCcpIHtcclxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5SdW4uJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUnVuOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRxJywgJyRyb290U2NvcGUnLCAnJGh0dHAnXTtcclxuXHJcbmZ1bmN0aW9uIFVzZXJGYWN0b3J5KCRxLCAkcm9vdFNjb3BlLCAkaHR0cCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIFVzZXIoKSB7XHJcbiAgICAgICAgdGhpcy5kZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgd2luZG93Lm9uU2lnbkluQ2FsbGJhY2sgPSB0aGlzLnNpZ25lZEluLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlZmVycmVkLnByb21pc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIFVzZXIucHJvdG90eXBlLnNpZ25lZEluID0gZnVuY3Rpb24oYXV0aFJlc3VsdHMpIHtcclxuICAgICAgICBpZiAoYXV0aFJlc3VsdHMuZXJyb3IpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChhdXRoUmVzdWx0cy5lcnJvcikge1xyXG4gICAgICAgICAgICBjYXNlICd1c2VyX3NpZ25lZF9vdXQnOlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2ltbWVkaWF0ZV9mYWlsZWQnOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYXV0aFJlc3VsdHMuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQoJ3BsdXMnLCd2MScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdXRoID0gYXV0aFJlc3VsdHM7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0aC5zdGF0dXMuc2lnbmVkX2luKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IGdhcGkuY2xpZW50LnBsdXMucGVvcGxlLmdldCh7J3VzZXJJZCcgOiAnbWUnfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5leGVjdXRlKGZ1bmN0aW9uKHByb2ZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9maWxlID0gcHJvZmlsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mZXRjaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH07XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkaHR0cC5nZXQoXy5zcHJpbnRmKCcvYXBpL3NpdGUvdXNlci8lcz9hY2Nlc3NfdG9rZW49JXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9maWxlLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRoLmFjY2Vzc190b2tlblxyXG4gICAgICAgICkpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5leHRlbmQocmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFVzZXIucHJvdG90eXBlLmV4dGVuZCA9IGZ1bmN0aW9uKHVzZXIpIHtcclxuICAgICAgICBhbmd1bGFyLmV4dGVuZCh0aGlzLCB1c2VyKTtcclxuICAgIH07XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZ2FwaS5hdXRoLnNpZ25PdXQoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5wcm9maWxlO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmF1dGg7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBuZXcgVXNlcigpO1xyXG59XHJcblxyXG5Vc2VyRmFjdG9yeS4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBVc2VyRmFjdG9yeTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG53aW5kb3cuYm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XHJcbiAgICBhbmd1bGFyLmJvb3RzdHJhcChkb2N1bWVudCwgWydkb3RkZXBsb3knXSk7XHJcbn07XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgnZG90ZGVwbG95JywgWyduZ1JvdXRlJywgJ3VpLmNvZGVtaXJyb3InXSlcclxuICAgIC5jb25maWcocmVxdWlyZSgnLi9Sb3V0ZXMnKSlcclxuICAgIC5ydW4ocmVxdWlyZSgnLi9SdW4nKSlcclxuICAgIC5zZXJ2aWNlKCdDb25maWcnLCByZXF1aXJlKCcuL0NvbmZpZycpKVxyXG4gICAgLmZhY3RvcnkoJ0ZpbGVVcGxvYWQnLCByZXF1aXJlKCcuL0ZpbGVVcGxvYWQnKSlcclxuICAgIC5mYWN0b3J5KCdVc2VyJywgcmVxdWlyZSgnLi9Vc2VyJykpXHJcbiAgICAuZGlyZWN0aXZlKCdkZEhlYWRlcicsIHJlcXVpcmUoJy4vRGRIZWFkZXInKSlcclxuICAgIC5kaXJlY3RpdmUoJ2RkVXBsb2FkZXInLCByZXF1aXJlKCcuL0RkVXBsb2FkZXInKSlcclxuICAgIC5jb250cm9sbGVyKCdEZFVwbG9hZGVyQ3RybCcsIHJlcXVpcmUoJy4vRGRVcGxvYWRlckN0cmwnKSlcclxuICAgIC5jb250cm9sbGVyKCdJbnN0YWxsQ3RybCcsIHJlcXVpcmUoJy4vSW5zdGFsbEN0cmwnKSlcclxuICAgIC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgcmVxdWlyZSgnLi9IZWFkZXJDdHJsJykpXHJcbiAgICAuY29udHJvbGxlcignRmlsZXNDdHJsJywgcmVxdWlyZSgnLi9GaWxlc0N0cmwnKSlcclxuICAgIC5jb250cm9sbGVyKCdNYWNoaW5lc0N0cmwnLCByZXF1aXJlKCcuL01hY2hpbmVzQ3RybCcpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ1Byb2ZpbGVzQ3RybCcsIHJlcXVpcmUoJy4vUHJvZmlsZXNDdHJsJykpOyJdfQ==
