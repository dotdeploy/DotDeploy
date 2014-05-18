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

var DEPENDENCIES = ['User'];

function FilesCtrl(User) {
    this.files = User.files;
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

var DEPENDENCIES = ['User'];

function MachinesCtrl(User) {
    this.machines = User.machines;
}

MachinesCtrl.$inject = DEPENDENCIES;

module.exports = MachinesCtrl;
},{}],6:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['User'];

function ProfilesCtrl(User) {
    this.profiles = User.profiles;
}

ProfilesCtrl.$inject = DEPENDENCIES;

module.exports = ProfilesCtrl;
},{}],7:[function(require,module,exports){
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
                        this.deferred.resolve();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFuc2VsXFxEb2N1bWVudHNcXEdpdEh1YlxcRG90RGVwbG95XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0NvbmZpZy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0RkSGVhZGVyLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvRmlsZXNDdHJsLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvSGVhZGVyQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL01hY2hpbmVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1Byb2ZpbGVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1JvdXRlcy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1J1bi5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1VzZXIuanMiLCJDOi9Vc2Vycy9BbnNlbC9Eb2N1bWVudHMvR2l0SHViL0RvdERlcGxveS9yZXNvdXJjZXMvcHVibGljL2pzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XHJcblxyXG5mdW5jdGlvbiBDb25maWcoKSB7fVxyXG5cclxuQ29uZmlnLnByb3RvdHlwZS5HUExVUyA9IHtcclxuICAgIENMSUVOVF9JRDogJzk0NDIwMzAxMjE0OC1qMG9jNjdkM2huNDBqM3FvcXEydms3am9vNmYwamp1NCcgK1xyXG4gICAgICAgICAgICAgICAnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJyxcclxuICAgIFNDT1BFOiAncHJvZmlsZScsXHJcbiAgICBBQ0NFU1NfVFlQRTogJ29mZmxpbmUnLFxyXG4gICAgVEhFTUU6ICdkYXJrJyxcclxuICAgIENPT0tJRV9QT0xJQ1k6ICdzaW5nbGVfaG9zdF9vcmlnaW4nXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENvbmZpZzsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gW107XHJcblxyXG5mdW5jdGlvbiBEZEhlYWRlcigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdoZWFkZXIuaHRtbCcsXHJcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcclxuICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdIZWFkZXJDdHJsIGFzIGhlYWRlcidcclxuICAgIH07XHJcbn1cclxuXHJcbkRkSGVhZGVyLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IERkSGVhZGVyOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIEZpbGVzQ3RybChVc2VyKSB7XHJcbiAgICB0aGlzLmZpbGVzID0gVXNlci5maWxlcztcclxufVxyXG5cclxuRmlsZXNDdHJsLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVzQ3RybDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckcm91dGUnLCAnJHNjb3BlJywgJ0NvbmZpZycsICdVc2VyJ107XHJcblxyXG5mdW5jdGlvbiBIZWFkZXJDdHJsKCRyb3V0ZSwgJHNjb3BlLCBDb25maWcsIFVzZXIpIHtcclxuICAgICRzY29wZS51c2VyID0gVXNlcjtcclxuICAgICRzY29wZS4kcm91dGUgPSAkcm91dGU7XHJcblxyXG4gICAgZ2FwaS5zaWduaW4ucmVuZGVyKCdsb2dpbi1ncGx1cycsIHtcclxuICAgICAgICAnY2FsbGJhY2snOiBVc2VyLnNpZ25lZEluLmJpbmQoVXNlciksXHJcbiAgICAgICAgJ2NsaWVudGlkJzogQ29uZmlnLkdQTFVTLkNMSUVOVF9JRCxcclxuICAgICAgICAnc2NvcGUnOiBDb25maWcuR1BMVVMuU0NPUEUsXHJcbiAgICAgICAgJ3RoZW1lJzogQ29uZmlnLkdQTFVTLlRIRU1FLFxyXG4gICAgICAgICdjb29raWVwb2xpY3knOiBDb25maWcuR1BMVVMuQ09PS0lFX1BPTElDWSxcclxuICAgICAgICAnYWNjZXNzdHlwZSc6IENvbmZpZy5HUExVUy5BQ0NFU1NfVFlQRVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbkhlYWRlckN0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSGVhZGVyQ3RybDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWydVc2VyJ107XHJcblxyXG5mdW5jdGlvbiBNYWNoaW5lc0N0cmwoVXNlcikge1xyXG4gICAgdGhpcy5tYWNoaW5lcyA9IFVzZXIubWFjaGluZXM7XHJcbn1cclxuXHJcbk1hY2hpbmVzQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNYWNoaW5lc0N0cmw7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnVXNlciddO1xyXG5cclxuZnVuY3Rpb24gUHJvZmlsZXNDdHJsKFVzZXIpIHtcclxuICAgIHRoaXMucHJvZmlsZXMgPSBVc2VyLnByb2ZpbGVzO1xyXG59XHJcblxyXG5Qcm9maWxlc0N0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUHJvZmlsZXNDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb3V0ZVByb3ZpZGVyJ107XHJcblxyXG5mdW5jdGlvbiBSb3V0ZXMoJHJvdXRlUHJvdmlkZXIpIHtcclxuICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgLndoZW4oJy9maWxlcy86ZmlsZUlkPycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdmaWxlcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0ZpbGVzQ3RybCBhcyBmaWxlcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvbWFjaGluZXMvOm1hY2hpbmVJZD8nLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbWFjaGluZXMuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdNYWNoaW5lc0N0cmwgYXMgbWFjaGluZXMnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL3Byb2ZpbGVzLzpwcm9maWxlSWQ/Jywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3Byb2ZpbGVzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZXNDdHJsIGFzIHByb2ZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9pbnN0YWxsJywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2luc3RhbGwuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdJbnN0YWxsQ3RybCBhcyBpbnN0YWxsJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLm90aGVyd2lzZSh7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaG9tZS5odG1sJ1xyXG4gICAgICAgIH0pO1xyXG59XHJcblxyXG5Sb3V0ZXMuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUm91dGVzOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRodHRwJywgJyRsb2NhdGlvbicsICckcm9vdFNjb3BlJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIFJ1bigkaHR0cCwgJGxvY2F0aW9uLCAkcm9vdFNjb3BlLCBVc2VyKSB7XHJcbiAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmdldCA9IHtcclxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXHJcbiAgICB9O1xyXG5cclxuICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0KSB7XHJcbiAgICAgICAgVXNlci5pbml0KCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKCFVc2VyLnByb2ZpbGUgJiZcclxuICAgICAgICAgICAgICAgIG5leHQudGVtcGxhdGVVcmwgIT09ICdob21lLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuUnVuLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJ1bjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckcScsICckcm9vdFNjb3BlJywgJyRodHRwJ107XHJcblxyXG5mdW5jdGlvbiBVc2VyRmFjdG9yeSgkcSwgJHJvb3RTY29wZSwgJGh0dHApIHtcclxuXHJcbiAgICBmdW5jdGlvbiBVc2VyKCkge1xyXG4gICAgICAgIHRoaXMuZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIHdpbmRvdy5vblNpZ25JbkNhbGxiYWNrID0gdGhpcy5zaWduZWRJbi5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIFVzZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWZlcnJlZC5wcm9taXNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5zaWduZWRJbiA9IGZ1bmN0aW9uKGF1dGhSZXN1bHRzKSB7XHJcbiAgICAgICAgaWYgKGF1dGhSZXN1bHRzLmVycm9yKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoYXV0aFJlc3VsdHMuZXJyb3IpIHtcclxuICAgICAgICAgICAgY2FzZSAndXNlcl9zaWduZWRfb3V0JzpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdpbW1lZGlhdGVfZmFpbGVkJzpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGF1dGhSZXN1bHRzLmVycm9yKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5sb2FkKCdwbHVzJywndjEnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuYXV0aCA9IGF1dGhSZXN1bHRzO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF1dGguc3RhdHVzLnNpZ25lZF9pbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QgPSBnYXBpLmNsaWVudC5wbHVzLnBlb3BsZS5nZXQoeyd1c2VySWQnIDogJ21lJ30pO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QuZXhlY3V0ZShmdW5jdGlvbihwcm9maWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2ZpbGUgPSBwcm9maWxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZldGNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5mZXRjaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRodHRwLmdldChfLnNwcmludGYoJy9hcGkvc2l0ZS91c2VyLyVzP2FjY2Vzc190b2tlbj0lcycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2ZpbGUuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGguYWNjZXNzX3Rva2VuXHJcbiAgICAgICAgKSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICB0aGlzLmV4dGVuZChyZXNwb25zZS5kYXRhKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5leHRlbmQgPSBmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgYW5ndWxhci5leHRlbmQodGhpcywgdXNlcik7XHJcbiAgICB9O1xyXG5cclxuICAgIFVzZXIucHJvdG90eXBlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhcGkuYXV0aC5zaWduT3V0KCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMucHJvZmlsZTtcclxuICAgICAgICBkZWxldGUgdGhpcy5hdXRoO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFVzZXIoKTtcclxufVxyXG5cclxuVXNlckZhY3RvcnkuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXNlckZhY3Rvcnk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxud2luZG93LmJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnZG90ZGVwbG95J10pO1xyXG59O1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ2RvdGRlcGxveScsIFsnbmdSb3V0ZSddKVxyXG4gICAgLmNvbmZpZyhyZXF1aXJlKCcuL1JvdXRlcycpKVxyXG4gICAgLnJ1bihyZXF1aXJlKCcuL1J1bicpKVxyXG4gICAgLnNlcnZpY2UoJ0NvbmZpZycsIHJlcXVpcmUoJy4vQ29uZmlnLmpzJykpXHJcbiAgICAuZmFjdG9yeSgnVXNlcicsIHJlcXVpcmUoJy4vVXNlci5qcycpKVxyXG4gICAgLmRpcmVjdGl2ZSgnZGRIZWFkZXInLCByZXF1aXJlKCcuL0RkSGVhZGVyLmpzJykpXHJcbiAgICAuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIHJlcXVpcmUoJy4vSGVhZGVyQ3RybCcpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0ZpbGVzQ3RybCcsIHJlcXVpcmUoJy4vRmlsZXNDdHJsJykpXHJcbiAgICAuY29udHJvbGxlcignTWFjaGluZXNDdHJsJywgcmVxdWlyZSgnLi9NYWNoaW5lc0N0cmwnKSlcclxuICAgIC5jb250cm9sbGVyKCdQcm9maWxlc0N0cmwnLCByZXF1aXJlKCcuL1Byb2ZpbGVzQ3RybCcpKTsiXX0=
