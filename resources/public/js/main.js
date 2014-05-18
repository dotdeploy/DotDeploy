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

var DEPENDENCIES = ['$http', '$scope', '$routeParams', 'User'];

function FilesCtrl($http, $scope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.files;
        this.selected = _.find(this.list, function(file) {
            return file['file-id'] === $routeParams.fileId;
        });
    }.bind(this));

    this.save = function() {
        $http({
            method: 'PATCH',
            url: '/api/site/file?access_token=' + User.auth.access_token,
            data: this.fileContents,
            headers: {
                'Content-Type': 'text/plain',
                'X-Path': this.path,
                'X-File-Id': this.selected['file-id'],
                'X-Previous-Revision': this.selected['revision-id']
            },
            transformRequest: angular.identity
        }).then(User.fetch);
    };

    this.upload = function() {
        $http({
            method: 'POST',
            url: '/api/site/file?access_token=' + User.auth.access_token,
            data: this.fileContents,
            headers: {
                'Content-Type': 'text/plain',
                'X-Path': this.selected.path
            },
            transformRequest: angular.identity
        }).then(User.fetch);
    };

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

var DEPENDENCIES = ['$http', '$scope', '$routeParams', 'User'];

function MachinesCtrl($http, $scope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.machines;
        this.selected = _.find(this.list, function(machine) {
            return machine['machine-id'] === $routeParams.machineId;
        });
        this.profiles = {};
        angular.forEach(User.profiles, function(profile) {
            this.profiles[profile] = false;
        }, this);
        angular.forEach(User.machines.profiles, function(profile) {
            this.profiles[profile] = true;
        }, this);
    }.bind(this));

    this.saveSelected = function() {
        var profiles = [];
        angular.forEach(this.profiles, function(isEnabled, profile) {
            if (isEnabled) {
                profiles.push(profile);
            }
        });
        $http({
            method: 'PATCH',
            url: _.sprintf('/api/site/user/%s/machine/%s?access_token=%s',
                           User._id,
                           this.selected['machine-id'],
                           User.auth.access_token),
            data: {
                'machine.$.name': this.selected.name,
                'machine.$.profiles': profiles
            },
            headers: {
                'Content-Type': 'text/plain',
                'X-Path': this.path,
                'X-File-Id': this.selected['file-id'],
                'X-Previous-Revision': this.selected['revision-id']
            },
            transformRequest: angular.identity
        }).then(User.fetch);
    };


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
        'Content-Type': 'application/json;charset=utf-8'
    };

    $http.defaults.headers.patch = {
        'Content-Type': 'application/json;charset=utf-8'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFuc2VsXFxEb2N1bWVudHNcXEdpdEh1YlxcRG90RGVwbG95XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0NvbmZpZy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0RkSGVhZGVyLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvRGRVcGxvYWRlci5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0RkVXBsb2FkZXJDdHJsLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvRmlsZVVwbG9hZC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0ZpbGVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0hlYWRlckN0cmwuanMiLCJDOi9Vc2Vycy9BbnNlbC9Eb2N1bWVudHMvR2l0SHViL0RvdERlcGxveS9yZXNvdXJjZXMvcHVibGljL2pzL3NyYy9JbnN0YWxsQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL01hY2hpbmVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1Byb2ZpbGVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1JvdXRlcy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1J1bi5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1VzZXIuanMiLCJDOi9Vc2Vycy9BbnNlbC9Eb2N1bWVudHMvR2l0SHViL0RvdERlcGxveS9yZXNvdXJjZXMvcHVibGljL2pzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZnVuY3Rpb24gQ29uZmlnKCkge31cclxuXHJcbkNvbmZpZy5wcm90b3R5cGUuR1BMVVMgPSB7XHJcbiAgICBDTElFTlRfSUQ6ICc5NDQyMDMwMTIxNDgtajBvYzY3ZDNobjQwajNxb3FxMnZrN2pvbzZmMGpqdTQnICtcclxuICAgICAgICAgICAgICAgJy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbScsXHJcbiAgICBTQ09QRTogJ3Byb2ZpbGUnLFxyXG4gICAgQUNDRVNTX1RZUEU6ICdvZmZsaW5lJyxcclxuICAgIFRIRU1FOiAnZGFyaycsXHJcbiAgICBDT09LSUVfUE9MSUNZOiAnc2luZ2xlX2hvc3Rfb3JpZ2luJ1xyXG59O1xyXG5cclxuQ29uZmlnLnByb3RvdHlwZS5UWVBFUyA9IFtcclxuICAgICcuYmFzaHJjJyxcclxuICAgICcuYmFzaF9wcm9maWxlJyxcclxuICAgICcuYmFzaF9hbGlhc2VzJyxcclxuICAgICcuYWxpYXNlcycsXHJcbiAgICAnLnpzaHJjJyxcclxuICAgICcuY3NocmMnLFxyXG4gICAgJy5sb2dpbicsXHJcbiAgICAnLnZpbXJjJyxcclxuICAgICcudG11eC5jb25mJyxcclxuICAgICcuZ2l0Y29uZmlnJyxcclxuICAgICcucHJvZmlsZScsXHJcbiAgICAnLmlucHV0cmMnLFxyXG4gICAgJy5kbXJjJyxcclxuICAgICcuc2NyZWVucmMnLFxyXG4gICAgJy5ucG1yYycsXHJcbiAgICAnLndnZXRyYycsXHJcbiAgICAnLmVtYWNzJ1xyXG5dO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb25maWc7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFtdO1xyXG5cclxuZnVuY3Rpb24gRGRIZWFkZXIoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaGVhZGVyLmh0bWwnLFxyXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXHJcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgICAgICBjb250cm9sbGVyOiAnSGVhZGVyQ3RybCBhcyBoZWFkZXInXHJcbiAgICB9O1xyXG59XHJcblxyXG5EZEhlYWRlci4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBEZEhlYWRlcjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gW107XHJcblxyXG5mdW5jdGlvbiBEZFVwbG9hZGVyKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ0RkVXBsb2FkZXIuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogZmFsc2UsXHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBjb250cm9sbGVyOiAnRGRVcGxvYWRlckN0cmwgYXMgdXBsb2FkZXInLFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHZhciAkZmlsZUlucHV0ID0gZWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPVwiZmlsZVwiXScpO1xyXG4gICAgICAgICAgICAkZmlsZUlucHV0LmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIHZhciBpO1xyXG4gICAgICAgICAgICAgICAgc2NvcGUubm90UmVhZHkgPSBlLnRhcmdldC5maWxlcy5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5maWxlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpIGluIGUudGFyZ2V0LmZpbGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlLnRhcmdldC5maWxlc1tpXSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZmlsZXMucHVzaChlLnRhcmdldC5maWxlc1tpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG5EZFVwbG9hZGVyLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERkVXBsb2FkZXI7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJHNjb3BlJywgJ0ZpbGVVcGxvYWQnXTtcclxuXHJcbmZ1bmN0aW9uIFVwbG9hZEN0cmwoJHNjb3BlLCBGaWxlVXBsb2FkKSB7XHJcbiAgICB0aGlzLnVwbG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIEZpbGVVcGxvYWQudXBsb2FkKCRzY29wZS5maWxlc1swXSk7XHJcbiAgICB9LmJpbmQodGhpcyk7XHJcbn1cclxuXHJcblVwbG9hZEN0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXBsb2FkQ3RybDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckaHR0cCcsICdVc2VyJ107XHJcblxyXG5mdW5jdGlvbiBGaWxlVXBsb2FkRmFjdG9yeSgkaHR0cCwgVXNlcikge1xyXG4gICAgZnVuY3Rpb24gRmlsZVVwbG9hZCgpIHt9XHJcblxyXG4gICAgRmlsZVVwbG9hZC5wcm90b3R5cGUudXBsb2FkID0gZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgIHZhciBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZCgncGF0aCcsIGZpbGUubmFtZSk7XHJcblxyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3NpdGUvZmlsZT9hY2Nlc3NfdG9rZW49JyArIFVzZXIuYXV0aC5hY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICAgIGRhdGE6IGZvcm1EYXRhLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAndGV4dC9wbGFpbicgfSxcclxuICAgICAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gbmV3IEZpbGVVcGxvYWQoKTtcclxufVxyXG5cclxuRmlsZVVwbG9hZEZhY3RvcnkuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVVcGxvYWRGYWN0b3J5OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRodHRwJywgJyRzY29wZScsICckcm91dGVQYXJhbXMnLCAnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gRmlsZXNDdHJsKCRodHRwLCAkc2NvcGUsICRyb3V0ZVBhcmFtcywgVXNlcikge1xyXG4gICAgVXNlci5pbml0KCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBVc2VyLmZpbGVzO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBfLmZpbmQodGhpcy5saXN0LCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaWxlWydmaWxlLWlkJ10gPT09ICRyb3V0ZVBhcmFtcy5maWxlSWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuc2F2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRodHRwKHtcclxuICAgICAgICAgICAgbWV0aG9kOiAnUEFUQ0gnLFxyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL3NpdGUvZmlsZT9hY2Nlc3NfdG9rZW49JyArIFVzZXIuYXV0aC5hY2Nlc3NfdG9rZW4sXHJcbiAgICAgICAgICAgIGRhdGE6IHRoaXMuZmlsZUNvbnRlbnRzLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nLFxyXG4gICAgICAgICAgICAgICAgJ1gtUGF0aCc6IHRoaXMucGF0aCxcclxuICAgICAgICAgICAgICAgICdYLUZpbGUtSWQnOiB0aGlzLnNlbGVjdGVkWydmaWxlLWlkJ10sXHJcbiAgICAgICAgICAgICAgICAnWC1QcmV2aW91cy1SZXZpc2lvbic6IHRoaXMuc2VsZWN0ZWRbJ3JldmlzaW9uLWlkJ11cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eVxyXG4gICAgICAgIH0pLnRoZW4oVXNlci5mZXRjaCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMudXBsb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9zaXRlL2ZpbGU/YWNjZXNzX3Rva2VuPScgKyBVc2VyLmF1dGguYWNjZXNzX3Rva2VuLFxyXG4gICAgICAgICAgICBkYXRhOiB0aGlzLmZpbGVDb250ZW50cyxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyxcclxuICAgICAgICAgICAgICAgICdYLVBhdGgnOiB0aGlzLnNlbGVjdGVkLnBhdGhcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eVxyXG4gICAgICAgIH0pLnRoZW4oVXNlci5mZXRjaCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuZWRpdG9yT3B0aW9ucyA9IHtcclxuICAgICAgICBpbmRlbnRVbml0OiA0LFxyXG4gICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxyXG4gICAgICAgIHRoZW1lOiAnc29sYXJpemVkIGRhcmsnXHJcbiAgICB9O1xyXG59XHJcblxyXG5GaWxlc0N0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZXNDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb3V0ZScsICckc2NvcGUnLCAnQ29uZmlnJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlckN0cmwoJHJvdXRlLCAkc2NvcGUsIENvbmZpZywgVXNlcikge1xyXG4gICAgJHNjb3BlLnVzZXIgPSBVc2VyO1xyXG4gICAgJHNjb3BlLiRyb3V0ZSA9ICRyb3V0ZTtcclxuXHJcbiAgICBnYXBpLnNpZ25pbi5yZW5kZXIoJ2xvZ2luLWdwbHVzJywge1xyXG4gICAgICAgICdjYWxsYmFjayc6IFVzZXIuc2lnbmVkSW4uYmluZChVc2VyKSxcclxuICAgICAgICAnY2xpZW50aWQnOiBDb25maWcuR1BMVVMuQ0xJRU5UX0lELFxyXG4gICAgICAgICdzY29wZSc6IENvbmZpZy5HUExVUy5TQ09QRSxcclxuICAgICAgICAndGhlbWUnOiBDb25maWcuR1BMVVMuVEhFTUUsXHJcbiAgICAgICAgJ2Nvb2tpZXBvbGljeSc6IENvbmZpZy5HUExVUy5DT09LSUVfUE9MSUNZLFxyXG4gICAgICAgICdhY2Nlc3N0eXBlJzogQ29uZmlnLkdQTFVTLkFDQ0VTU19UWVBFXHJcbiAgICB9KTtcclxufVxyXG5cclxuSGVhZGVyQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRzY29wZScsICckaHR0cCcsICdVc2VyJ107XHJcblxyXG5mdW5jdGlvbiBJbnN0YWxsQ3RybCgkc2NvcGUsICRodHRwLCBVc2VyKSB7XHJcbiAgICBVc2VyLmluaXQoKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc2l0ZS90b2tlbj9hY2Nlc3NfdG9rZW49JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBVc2VyLmF1dGguYWNjZXNzX3Rva2VuKTtcclxuICAgIH0uYmluZCh0aGlzKSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIHRoaXMuY29tbWFuZCA9ICdjdXJsIC9zdGF0aWMvbGliL2luc3RhbGwuc2ggfCBiYXNoIC1zICcgKyByZXNwb25zZS5kYXRhO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLmVkaXRvck9wdGlvbnMgPSB7XHJcbiAgICAgICAgaW5kZW50VW5pdDogNCxcclxuICAgICAgICB0aGVtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgIHJlYWRPbmx5OiB0cnVlXHJcbiAgICB9O1xyXG59XHJcblxyXG5JbnN0YWxsQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnN0YWxsQ3RybDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckaHR0cCcsICckc2NvcGUnLCAnJHJvdXRlUGFyYW1zJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIE1hY2hpbmVzQ3RybCgkaHR0cCwgJHNjb3BlLCAkcm91dGVQYXJhbXMsIFVzZXIpIHtcclxuICAgIFVzZXIuaW5pdCgpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gVXNlci5tYWNoaW5lcztcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gXy5maW5kKHRoaXMubGlzdCwgZnVuY3Rpb24obWFjaGluZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbWFjaGluZVsnbWFjaGluZS1pZCddID09PSAkcm91dGVQYXJhbXMubWFjaGluZUlkO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMucHJvZmlsZXMgPSB7fTtcclxuICAgICAgICBhbmd1bGFyLmZvckVhY2goVXNlci5wcm9maWxlcywgZnVuY3Rpb24ocHJvZmlsZSkge1xyXG4gICAgICAgICAgICB0aGlzLnByb2ZpbGVzW3Byb2ZpbGVdID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKFVzZXIubWFjaGluZXMucHJvZmlsZXMsIGZ1bmN0aW9uKHByb2ZpbGUpIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9maWxlc1twcm9maWxlXSA9IHRydWU7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIHRoaXMuc2F2ZVNlbGVjdGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHByb2ZpbGVzID0gW107XHJcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMucHJvZmlsZXMsIGZ1bmN0aW9uKGlzRW5hYmxlZCwgcHJvZmlsZSkge1xyXG4gICAgICAgICAgICBpZiAoaXNFbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9maWxlcy5wdXNoKHByb2ZpbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXHJcbiAgICAgICAgICAgIHVybDogXy5zcHJpbnRmKCcvYXBpL3NpdGUvdXNlci8lcy9tYWNoaW5lLyVzP2FjY2Vzc190b2tlbj0lcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFVzZXIuX2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkWydtYWNoaW5lLWlkJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFVzZXIuYXV0aC5hY2Nlc3NfdG9rZW4pLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAnbWFjaGluZS4kLm5hbWUnOiB0aGlzLnNlbGVjdGVkLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAnbWFjaGluZS4kLnByb2ZpbGVzJzogcHJvZmlsZXNcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICd0ZXh0L3BsYWluJyxcclxuICAgICAgICAgICAgICAgICdYLVBhdGgnOiB0aGlzLnBhdGgsXHJcbiAgICAgICAgICAgICAgICAnWC1GaWxlLUlkJzogdGhpcy5zZWxlY3RlZFsnZmlsZS1pZCddLFxyXG4gICAgICAgICAgICAgICAgJ1gtUHJldmlvdXMtUmV2aXNpb24nOiB0aGlzLnNlbGVjdGVkWydyZXZpc2lvbi1pZCddXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHlcclxuICAgICAgICB9KS50aGVuKFVzZXIuZmV0Y2gpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgdGhpcy5nZXRTZWxlY3RlZE5hbWUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdMb2FkaW5nLi4uJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnNlbGVjdGVkLm5hbWUgfHwgJycpICtcclxuICAgICAgICAgICAgICAgXy5zcHJpbnRmKCh0aGlzLnNlbGVjdGVkLm5hbWUgPyAnICglcyknIDogJyVzJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLmhvc3RuYW1lKTtcclxuICAgIH07XHJcbn1cclxuXHJcbk1hY2hpbmVzQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYWNoaW5lc0N0cmw7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJHJvb3RTY29wZScsICckcm91dGVQYXJhbXMnLCAnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gUHJvZmlsZXNDdHJsKCRyb290U2NvcGUsICRyb3V0ZVBhcmFtcywgVXNlcikge1xyXG4gICAgVXNlci5pbml0KCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBVc2VyLnByb2ZpbGVzO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBfLmZpbmQodGhpcy5saXN0LCBmdW5jdGlvbihwcm9maWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9maWxlWydwcm9maWxlLWlkJ10gPT09ICRyb3V0ZVBhcmFtcy5wcm9maWxlSWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5Qcm9maWxlc0N0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvZmlsZXNDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb3V0ZVByb3ZpZGVyJ107XHJcblxyXG5mdW5jdGlvbiBSb3V0ZXMoJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgLndoZW4oJy9maWxlcycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdmaWxlcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0ZpbGVzQ3RybCBhcyBmaWxlcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvZmlsZXMvOmZpbGVJZCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdmaWxlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRmlsZXNDdHJsIGFzIGZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9tYWNoaW5lcycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtYWNoaW5lcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ01hY2hpbmVzQ3RybCBhcyBtYWNoaW5lcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvbWFjaGluZXMvOm1hY2hpbmVJZCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtYWNoaW5lLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnTWFjaGluZXNDdHJsIGFzIG1hY2hpbmVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9wcm9maWxlcycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVzQ3RybCBhcyBwcm9maWxlcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvcHJvZmlsZXMvOnByb2ZpbGVJZCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9maWxlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZXNDdHJsIGFzIHByb2ZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy91cGxvYWQnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndXBsb2FkLmh0bWwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2luc3RhbGwnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaW5zdGFsbC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0luc3RhbGxDdHJsIGFzIGluc3RhbGwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub3RoZXJ3aXNlKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdob21lLmh0bWwnXHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcblJvdXRlcy4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXM7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJGh0dHAnLCAnJGxvY2F0aW9uJywgJyRyb290U2NvcGUnLCAnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gUnVuKCRodHRwLCAkbG9jYXRpb24sICRyb290U2NvcGUsIFVzZXIpIHtcclxuICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuZ2V0ID0ge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04J1xyXG4gICAgfTtcclxuXHJcbiAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLnBhdGNoID0ge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04J1xyXG4gICAgfTtcclxuXHJcbiAgICAkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgbmV4dCkge1xyXG4gICAgICAgIFVzZXIuaW5pdCgpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICghVXNlci5wcm9maWxlICYmXHJcbiAgICAgICAgICAgICAgICBuZXh0LnRlbXBsYXRlVXJsICE9PSAnaG9tZS5odG1sJykge1xyXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcblJ1bi4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSdW47IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJHEnLCAnJHJvb3RTY29wZScsICckaHR0cCddO1xyXG5cclxuZnVuY3Rpb24gVXNlckZhY3RvcnkoJHEsICRyb290U2NvcGUsICRodHRwKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gVXNlcigpIHtcclxuICAgICAgICB0aGlzLmRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICB3aW5kb3cub25TaWduSW5DYWxsYmFjayA9IHRoaXMuc2lnbmVkSW4uYmluZCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmZXJyZWQucHJvbWlzZTtcclxuICAgIH07XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUuc2lnbmVkSW4gPSBmdW5jdGlvbihhdXRoUmVzdWx0cykge1xyXG4gICAgICAgIGlmIChhdXRoUmVzdWx0cy5lcnJvcikge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGF1dGhSZXN1bHRzLmVycm9yKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3VzZXJfc2lnbmVkX291dCc6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnaW1tZWRpYXRlX2ZhaWxlZCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihhdXRoUmVzdWx0cy5lcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQubG9hZCgncGx1cycsJ3YxJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1dGggPSBhdXRoUmVzdWx0cztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdXRoLnN0YXR1cy5zaWduZWRfaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ID0gZ2FwaS5jbGllbnQucGx1cy5wZW9wbGUuZ2V0KHsndXNlcklkJyA6ICdtZSd9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0LmV4ZWN1dGUoZnVuY3Rpb24ocHJvZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2ZpbGUgPSBwcm9maWxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZldGNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5mZXRjaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRodHRwLmdldChfLnNwcmludGYoJy9hcGkvc2l0ZS91c2VyLyVzP2FjY2Vzc190b2tlbj0lcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2ZpbGUuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGguYWNjZXNzX3Rva2VuXHJcbiAgICAgICAgKSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4dGVuZChyZXNwb25zZS5kYXRhKTtcclxuICAgICAgICAgICAgdGhpcy5kZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH07XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHVzZXIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYXBpLmF1dGguc2lnbk91dCgpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnByb2ZpbGU7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuYXV0aDtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG5ldyBVc2VyKCk7XHJcbn1cclxuXHJcblVzZXJGYWN0b3J5LiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJGYWN0b3J5OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbndpbmRvdy5ib290c3RyYXAgPSBmdW5jdGlvbigpIHtcclxuICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ2RvdGRlcGxveSddKTtcclxufTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdkb3RkZXBsb3knLCBbJ25nUm91dGUnLCAndWkuY29kZW1pcnJvciddKVxyXG4gICAgLmNvbmZpZyhyZXF1aXJlKCcuL1JvdXRlcycpKVxyXG4gICAgLnJ1bihyZXF1aXJlKCcuL1J1bicpKVxyXG4gICAgLnNlcnZpY2UoJ0NvbmZpZycsIHJlcXVpcmUoJy4vQ29uZmlnJykpXHJcbiAgICAuZmFjdG9yeSgnRmlsZVVwbG9hZCcsIHJlcXVpcmUoJy4vRmlsZVVwbG9hZCcpKVxyXG4gICAgLmZhY3RvcnkoJ1VzZXInLCByZXF1aXJlKCcuL1VzZXInKSlcclxuICAgIC5kaXJlY3RpdmUoJ2RkSGVhZGVyJywgcmVxdWlyZSgnLi9EZEhlYWRlcicpKVxyXG4gICAgLmRpcmVjdGl2ZSgnZGRVcGxvYWRlcicsIHJlcXVpcmUoJy4vRGRVcGxvYWRlcicpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0RkVXBsb2FkZXJDdHJsJywgcmVxdWlyZSgnLi9EZFVwbG9hZGVyQ3RybCcpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0luc3RhbGxDdHJsJywgcmVxdWlyZSgnLi9JbnN0YWxsQ3RybCcpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCByZXF1aXJlKCcuL0hlYWRlckN0cmwnKSlcclxuICAgIC5jb250cm9sbGVyKCdGaWxlc0N0cmwnLCByZXF1aXJlKCcuL0ZpbGVzQ3RybCcpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ01hY2hpbmVzQ3RybCcsIHJlcXVpcmUoJy4vTWFjaGluZXNDdHJsJykpXHJcbiAgICAuY29udHJvbGxlcignUHJvZmlsZXNDdHJsJywgcmVxdWlyZSgnLi9Qcm9maWxlc0N0cmwnKSk7Il19
