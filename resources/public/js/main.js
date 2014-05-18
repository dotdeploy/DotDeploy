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

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function FilesCtrl($rootScope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.files;
        this.selected = _.find(this.list, function(file) {
            return file['file-id'] === $routeParams.fileId;
        });
    }.bind(this));
}

FilesCtrl.$inject = DEPENDENCIES;

module.exports = FilesCtrl;
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$rootScope', '$routeParams', 'User'];

function MachinesCtrl($rootScope, $routeParams, User) {
    User.init().then(function() {
        this.list = User.machines;
        this.selected = _.find(this.list, function(machine) {
            return machine['machine-id'] === $routeParams.machineId;
        });
    }.bind(this));
}

MachinesCtrl.$inject = DEPENDENCIES;

module.exports = MachinesCtrl;
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
            templateUrl: 'upload.html',
            controller: 'UploadCtrl as uploader'
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{"./Config.js":1,"./DdHeader.js":2,"./FilesCtrl":3,"./HeaderCtrl":4,"./MachinesCtrl":5,"./ProfilesCtrl":6,"./Routes":7,"./Run":8,"./User.js":9}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFuc2VsXFxEb2N1bWVudHNcXEdpdEh1YlxcRG90RGVwbG95XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0NvbmZpZy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0RkSGVhZGVyLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvRmlsZXNDdHJsLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvSGVhZGVyQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL01hY2hpbmVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1Byb2ZpbGVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1JvdXRlcy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1J1bi5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1VzZXIuanMiLCJDOi9Vc2Vycy9BbnNlbC9Eb2N1bWVudHMvR2l0SHViL0RvdERlcGxveS9yZXNvdXJjZXMvcHVibGljL2pzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmZ1bmN0aW9uIENvbmZpZygpIHt9XHJcblxyXG5Db25maWcucHJvdG90eXBlLkdQTFVTID0ge1xyXG4gICAgQ0xJRU5UX0lEOiAnOTQ0MjAzMDEyMTQ4LWowb2M2N2QzaG40MGozcW9xcTJ2azdqb282ZjBqanU0JyArXHJcbiAgICAgICAgICAgICAgICcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxyXG4gICAgU0NPUEU6ICdwcm9maWxlJyxcclxuICAgIEFDQ0VTU19UWVBFOiAnb2ZmbGluZScsXHJcbiAgICBUSEVNRTogJ2RhcmsnLFxyXG4gICAgQ09PS0lFX1BPTElDWTogJ3NpbmdsZV9ob3N0X29yaWdpbidcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIERkSGVhZGVyKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2hlYWRlci5odG1sJyxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0hlYWRlckN0cmwgYXMgaGVhZGVyJ1xyXG4gICAgfTtcclxufVxyXG5cclxuRGRIZWFkZXIuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGRIZWFkZXI7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJHJvb3RTY29wZScsICckcm91dGVQYXJhbXMnLCAnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gRmlsZXNDdHJsKCRyb290U2NvcGUsICRyb3V0ZVBhcmFtcywgVXNlcikge1xyXG4gICAgVXNlci5pbml0KCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBVc2VyLmZpbGVzO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBfLmZpbmQodGhpcy5saXN0LCBmdW5jdGlvbihmaWxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaWxlWydmaWxlLWlkJ10gPT09ICRyb3V0ZVBhcmFtcy5maWxlSWQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5GaWxlc0N0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZXNDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb3V0ZScsICckc2NvcGUnLCAnQ29uZmlnJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlckN0cmwoJHJvdXRlLCAkc2NvcGUsIENvbmZpZywgVXNlcikge1xyXG4gICAgJHNjb3BlLnVzZXIgPSBVc2VyO1xyXG4gICAgJHNjb3BlLiRyb3V0ZSA9ICRyb3V0ZTtcclxuXHJcbiAgICBnYXBpLnNpZ25pbi5yZW5kZXIoJ2xvZ2luLWdwbHVzJywge1xyXG4gICAgICAgICdjYWxsYmFjayc6IFVzZXIuc2lnbmVkSW4uYmluZChVc2VyKSxcclxuICAgICAgICAnY2xpZW50aWQnOiBDb25maWcuR1BMVVMuQ0xJRU5UX0lELFxyXG4gICAgICAgICdzY29wZSc6IENvbmZpZy5HUExVUy5TQ09QRSxcclxuICAgICAgICAndGhlbWUnOiBDb25maWcuR1BMVVMuVEhFTUUsXHJcbiAgICAgICAgJ2Nvb2tpZXBvbGljeSc6IENvbmZpZy5HUExVUy5DT09LSUVfUE9MSUNZLFxyXG4gICAgICAgICdhY2Nlc3N0eXBlJzogQ29uZmlnLkdQTFVTLkFDQ0VTU19UWVBFXHJcbiAgICB9KTtcclxufVxyXG5cclxuSGVhZGVyQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb290U2NvcGUnLCAnJHJvdXRlUGFyYW1zJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIE1hY2hpbmVzQ3RybCgkcm9vdFNjb3BlLCAkcm91dGVQYXJhbXMsIFVzZXIpIHtcclxuICAgIFVzZXIuaW5pdCgpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gVXNlci5tYWNoaW5lcztcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gXy5maW5kKHRoaXMubGlzdCwgZnVuY3Rpb24obWFjaGluZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbWFjaGluZVsnbWFjaGluZS1pZCddID09PSAkcm91dGVQYXJhbXMubWFjaGluZUlkO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuTWFjaGluZXNDdHJsLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hY2hpbmVzQ3RybDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckcm9vdFNjb3BlJywgJyRyb3V0ZVBhcmFtcycsICdVc2VyJ107XHJcblxyXG5mdW5jdGlvbiBQcm9maWxlc0N0cmwoJHJvb3RTY29wZSwgJHJvdXRlUGFyYW1zLCBVc2VyKSB7XHJcbiAgICBVc2VyLmluaXQoKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMubGlzdCA9IFVzZXIucHJvZmlsZXM7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IF8uZmluZCh0aGlzLmxpc3QsIGZ1bmN0aW9uKHByb2ZpbGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByb2ZpbGVbJ3Byb2ZpbGUtaWQnXSA9PT0gJHJvdXRlUGFyYW1zLnByb2ZpbGVJZDtcclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcblByb2ZpbGVzQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm9maWxlc0N0cmw7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJHJvdXRlUHJvdmlkZXInXTtcclxuXHJcbmZ1bmN0aW9uIFJvdXRlcygkcm91dGVQcm92aWRlcikge1xyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignL2ZpbGVzJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2ZpbGVzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRmlsZXNDdHJsIGFzIGZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9maWxlcy86ZmlsZUlkJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2ZpbGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdGaWxlc0N0cmwgYXMgZmlsZXMnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL21hY2hpbmVzJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ21hY2hpbmVzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnTWFjaGluZXNDdHJsIGFzIG1hY2hpbmVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9tYWNoaW5lcy86bWFjaGluZUlkJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ21hY2hpbmUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdNYWNoaW5lc0N0cmwgYXMgbWFjaGluZXMnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL3Byb2ZpbGVzJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGVzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZXNDdHJsIGFzIHByb2ZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9wcm9maWxlcy86cHJvZmlsZUlkJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlc0N0cmwgYXMgcHJvZmlsZXMnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL3VwbG9hZCcsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd1cGxvYWQuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdVcGxvYWRDdHJsIGFzIHVwbG9hZGVyJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9pbnN0YWxsJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2luc3RhbGwuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdJbnN0YWxsQ3RybCBhcyBpbnN0YWxsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm90aGVyd2lzZSh7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS5odG1sJ1xyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG5Sb3V0ZXMuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVzOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRodHRwJywgJyRsb2NhdGlvbicsICckcm9vdFNjb3BlJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIFJ1bigkaHR0cCwgJGxvY2F0aW9uLCAkcm9vdFNjb3BlLCBVc2VyKSB7XHJcbiAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmdldCA9IHtcclxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICB9O1xyXG5cclxuICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0KSB7XHJcbiAgICAgICAgVXNlci5pbml0KCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCFVc2VyLnByb2ZpbGUgJiZcclxuICAgICAgICAgICAgICAgIG5leHQudGVtcGxhdGVVcmwgIT09ICdob21lLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuUnVuLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJ1bjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckcScsICckcm9vdFNjb3BlJywgJyRodHRwJ107XHJcblxyXG5mdW5jdGlvbiBVc2VyRmFjdG9yeSgkcSwgJHJvb3RTY29wZSwgJGh0dHApIHtcclxuXHJcbiAgICBmdW5jdGlvbiBVc2VyKCkge1xyXG4gICAgICAgIHRoaXMuZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIHdpbmRvdy5vblNpZ25JbkNhbGxiYWNrID0gdGhpcy5zaWduZWRJbi5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIFVzZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5zaWduZWRJbiA9IGZ1bmN0aW9uKGF1dGhSZXN1bHRzKSB7XHJcbiAgICAgICAgaWYgKGF1dGhSZXN1bHRzLmVycm9yKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoYXV0aFJlc3VsdHMuZXJyb3IpIHtcclxuICAgICAgICAgICAgY2FzZSAndXNlcl9zaWduZWRfb3V0JzpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdpbW1lZGlhdGVfZmFpbGVkJzpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGF1dGhSZXN1bHRzLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5sb2FkKCdwbHVzJywndjEnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuYXV0aCA9IGF1dGhSZXN1bHRzO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF1dGguc3RhdHVzLnNpZ25lZF9pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBnYXBpLmNsaWVudC5wbHVzLnBlb3BsZS5nZXQoeyd1c2VySWQnIDogJ21lJ30pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuZXhlY3V0ZShmdW5jdGlvbihwcm9maWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZmlsZSA9IHByb2ZpbGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2goKTtcclxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9O1xyXG5cclxuICAgIFVzZXIucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJGh0dHAuZ2V0KF8uc3ByaW50ZignL2FwaS9zaXRlL3VzZXIvJXM/YWNjZXNzX3Rva2VuPSVzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvZmlsZS5pZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0aC5hY2Nlc3NfdG9rZW5cclxuICAgICAgICApKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXh0ZW5kKHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICB0aGlzLmRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5leHRlbmQgPSBmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgdXNlcik7XHJcbiAgICB9O1xyXG5cclxuICAgIFVzZXIucHJvdG90eXBlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhcGkuYXV0aC5zaWduT3V0KCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMucHJvZmlsZTtcclxuICAgICAgICBkZWxldGUgdGhpcy5hdXRoO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFVzZXIoKTtcclxufVxyXG5cclxuVXNlckZhY3RvcnkuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXNlckZhY3Rvcnk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxud2luZG93LmJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnZG90ZGVwbG95J10pO1xyXG59O1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2RvdGRlcGxveScsIFsnbmdSb3V0ZSddKVxyXG4gICAgLmNvbmZpZyhyZXF1aXJlKCcuL1JvdXRlcycpKVxyXG4gICAgLnJ1bihyZXF1aXJlKCcuL1J1bicpKVxyXG4gICAgLnNlcnZpY2UoJ0NvbmZpZycsIHJlcXVpcmUoJy4vQ29uZmlnLmpzJykpXHJcbiAgICAuZmFjdG9yeSgnVXNlcicsIHJlcXVpcmUoJy4vVXNlci5qcycpKVxyXG4gICAgLmRpcmVjdGl2ZSgnZGRIZWFkZXInLCByZXF1aXJlKCcuL0RkSGVhZGVyLmpzJykpXHJcbiAgICAuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIHJlcXVpcmUoJy4vSGVhZGVyQ3RybCcpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0ZpbGVzQ3RybCcsIHJlcXVpcmUoJy4vRmlsZXNDdHJsJykpXHJcbiAgICAuY29udHJvbGxlcignTWFjaGluZXNDdHJsJywgcmVxdWlyZSgnLi9NYWNoaW5lc0N0cmwnKSlcclxuICAgIC5jb250cm9sbGVyKCdQcm9maWxlc0N0cmwnLCByZXF1aXJlKCcuL1Byb2ZpbGVzQ3RybCcpKTsiXX0=
