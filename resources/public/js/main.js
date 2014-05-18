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

var DEPENDENCIES = [];

function FilesCtrl() {
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

var DEPENDENCIES = [];

function MachinesCtrl() {
}

MachinesCtrl.$inject = DEPENDENCIES;

module.exports = MachinesCtrl;
},{}],6:[function(require,module,exports){
'use strict';

var DEPENDENCIES = [];

function ProfilesCtrl() {
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

var DEPENDENCIES = ['$http'];

function Run($http) {
    $http.defaults.headers.get = {
        'Content-Type': 'application/json'
    };
}

Run.$inject = DEPENDENCIES;

module.exports = Run;
},{}],9:[function(require,module,exports){
'use strict';

var DEPENDENCIES = ['$rootScope', '$http'];

function UserFactory($rootScope, $http) {

    function User() {
        window.onSignInCallback = this.signedIn.bind(this);
    }

    User.prototype.signedIn = function(authResults) {
        if (authResults.error) {
            switch (authResults.error) {
            case 'user_signed_out':
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXEFuc2VsXFxEb2N1bWVudHNcXEdpdEh1YlxcRG90RGVwbG95XFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0NvbmZpZy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL0RkSGVhZGVyLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvRmlsZXNDdHJsLmpzIiwiQzovVXNlcnMvQW5zZWwvRG9jdW1lbnRzL0dpdEh1Yi9Eb3REZXBsb3kvcmVzb3VyY2VzL3B1YmxpYy9qcy9zcmMvSGVhZGVyQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL01hY2hpbmVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1Byb2ZpbGVzQ3RybC5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1JvdXRlcy5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1J1bi5qcyIsIkM6L1VzZXJzL0Fuc2VsL0RvY3VtZW50cy9HaXRIdWIvRG90RGVwbG95L3Jlc291cmNlcy9wdWJsaWMvanMvc3JjL1VzZXIuanMiLCJDOi9Vc2Vycy9BbnNlbC9Eb2N1bWVudHMvR2l0SHViL0RvdERlcGxveS9yZXNvdXJjZXMvcHVibGljL2pzL3NyYy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmZ1bmN0aW9uIENvbmZpZygpIHt9XHJcblxyXG5Db25maWcucHJvdG90eXBlLkdQTFVTID0ge1xyXG4gICAgQ0xJRU5UX0lEOiAnOTQ0MjAzMDEyMTQ4LWowb2M2N2QzaG40MGozcW9xcTJ2azdqb282ZjBqanU0JyArXHJcbiAgICAgICAgICAgICAgICcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxyXG4gICAgU0NPUEU6ICdwcm9maWxlJyxcclxuICAgIEFDQ0VTU19UWVBFOiAnb2ZmbGluZScsXHJcbiAgICBUSEVNRTogJ2RhcmsnLFxyXG4gICAgQ09PS0lFX1BPTElDWTogJ3NpbmdsZV9ob3N0X29yaWdpbidcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29uZmlnOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIERkSGVhZGVyKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2hlYWRlci5odG1sJyxcclxuICAgICAgICByZXBsYWNlOiB0cnVlLFxyXG4gICAgICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0hlYWRlckN0cmwgYXMgaGVhZGVyJ1xyXG4gICAgfTtcclxufVxyXG5cclxuRGRIZWFkZXIuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRGRIZWFkZXI7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFtdO1xyXG5cclxuZnVuY3Rpb24gRmlsZXNDdHJsKCkge1xyXG59XHJcblxyXG5GaWxlc0N0cmwuJGluamVjdCA9IERFUEVOREVOQ0lFUztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZXNDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbJyRyb3V0ZScsICckc2NvcGUnLCAnQ29uZmlnJywgJ1VzZXInXTtcclxuXHJcbmZ1bmN0aW9uIEhlYWRlckN0cmwoJHJvdXRlLCAkc2NvcGUsIENvbmZpZywgVXNlcikge1xyXG4gICAgJHNjb3BlLnVzZXIgPSBVc2VyO1xyXG4gICAgJHNjb3BlLiRyb3V0ZSA9ICRyb3V0ZTtcclxuXHJcbiAgICBnYXBpLnNpZ25pbi5yZW5kZXIoJ2xvZ2luLWdwbHVzJywge1xyXG4gICAgICAgICdjYWxsYmFjayc6IFVzZXIuc2lnbmVkSW4uYmluZChVc2VyKSxcclxuICAgICAgICAnY2xpZW50aWQnOiBDb25maWcuR1BMVVMuQ0xJRU5UX0lELFxyXG4gICAgICAgICdzY29wZSc6IENvbmZpZy5HUExVUy5TQ09QRSxcclxuICAgICAgICAndGhlbWUnOiBDb25maWcuR1BMVVMuVEhFTUUsXHJcbiAgICAgICAgJ2Nvb2tpZXBvbGljeSc6IENvbmZpZy5HUExVUy5DT09LSUVfUE9MSUNZLFxyXG4gICAgICAgICdhY2Nlc3N0eXBlJzogQ29uZmlnLkdQTFVTLkFDQ0VTU19UWVBFXHJcbiAgICB9KTtcclxufVxyXG5cclxuSGVhZGVyQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXJDdHJsOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBERVBFTkRFTkNJRVMgPSBbXTtcclxuXHJcbmZ1bmN0aW9uIE1hY2hpbmVzQ3RybCgpIHtcclxufVxyXG5cclxuTWFjaGluZXNDdHJsLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1hY2hpbmVzQ3RybDsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gW107XHJcblxyXG5mdW5jdGlvbiBQcm9maWxlc0N0cmwoKSB7XHJcbn1cclxuXHJcblByb2ZpbGVzQ3RybC4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQcm9maWxlc0N0cmw7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJHJvdXRlUHJvdmlkZXInXTtcclxuXHJcbmZ1bmN0aW9uIFJvdXRlcygkcm91dGVQcm92aWRlcikge1xyXG4gICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAud2hlbignL2ZpbGVzLzpmaWxlSWQ/Jywge1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2ZpbGVzLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnRmlsZXNDdHJsIGFzIGZpbGVzJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLndoZW4oJy9tYWNoaW5lcy86bWFjaGluZUlkPycsIHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdtYWNoaW5lcy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ01hY2hpbmVzQ3RybCBhcyBtYWNoaW5lcydcclxuICAgICAgICB9KVxyXG4gICAgICAgIC53aGVuKCcvcHJvZmlsZXMvOnByb2ZpbGVJZD8nLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAncHJvZmlsZXMuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlc0N0cmwgYXMgcHJvZmlsZXMnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAud2hlbignL2luc3RhbGwnLCB7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnaW5zdGFsbC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0luc3RhbGxDdHJsIGFzIGluc3RhbGwnXHJcbiAgICAgICAgfSlcclxuICAgICAgICAub3RoZXJ3aXNlKHtcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdob21lLmh0bWwnXHJcbiAgICAgICAgfSk7XHJcbn1cclxuXHJcblJvdXRlcy4kaW5qZWN0ID0gREVQRU5ERU5DSUVTO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXM7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERFUEVOREVOQ0lFUyA9IFsnJGh0dHAnXTtcclxuXHJcbmZ1bmN0aW9uIFJ1bigkaHR0cCkge1xyXG4gICAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5nZXQgPSB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xyXG4gICAgfTtcclxufVxyXG5cclxuUnVuLiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJ1bjsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgREVQRU5ERU5DSUVTID0gWyckcm9vdFNjb3BlJywgJyRodHRwJ107XHJcblxyXG5mdW5jdGlvbiBVc2VyRmFjdG9yeSgkcm9vdFNjb3BlLCAkaHR0cCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIFVzZXIoKSB7XHJcbiAgICAgICAgd2luZG93Lm9uU2lnbkluQ2FsbGJhY2sgPSB0aGlzLnNpZ25lZEluLmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUuc2lnbmVkSW4gPSBmdW5jdGlvbihhdXRoUmVzdWx0cykge1xyXG4gICAgICAgIGlmIChhdXRoUmVzdWx0cy5lcnJvcikge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGF1dGhSZXN1bHRzLmVycm9yKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3VzZXJfc2lnbmVkX291dCc6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYXV0aFJlc3VsdHMuZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQoJ3BsdXMnLCd2MScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3Q7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hdXRoID0gYXV0aFJlc3VsdHM7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0aC5zdGF0dXMuc2lnbmVkX2luKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCA9IGdhcGkuY2xpZW50LnBsdXMucGVvcGxlLmdldCh7J3VzZXJJZCcgOiAnbWUnfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdC5leGVjdXRlKGZ1bmN0aW9uKHByb2ZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9maWxlID0gcHJvZmlsZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mZXRjaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH07XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkaHR0cC5nZXQoXy5zcHJpbnRmKCcvYXBpL3NpdGUvdXNlci8lcz9hY2Nlc3NfdG9rZW49JXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9maWxlLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRoLmFjY2Vzc190b2tlblxyXG4gICAgICAgICkpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5leHRlbmQocmVzcG9uc2UuZGF0YSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH07XHJcblxyXG4gICAgVXNlci5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHRoaXMsIHVzZXIpO1xyXG4gICAgfTtcclxuXHJcbiAgICBVc2VyLnByb3RvdHlwZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYXBpLmF1dGguc2lnbk91dCgpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnByb2ZpbGU7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuYXV0aDtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIG5ldyBVc2VyKCk7XHJcbn1cclxuXHJcblVzZXJGYWN0b3J5LiRpbmplY3QgPSBERVBFTkRFTkNJRVM7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFVzZXJGYWN0b3J5OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbndpbmRvdy5ib290c3RyYXAgPSBmdW5jdGlvbigpIHtcclxuICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ2RvdGRlcGxveSddKTtcclxufTtcclxuXHJcbmFuZ3VsYXIubW9kdWxlKCdkb3RkZXBsb3knLCBbJ25nUm91dGUnXSlcclxuICAgIC5jb25maWcocmVxdWlyZSgnLi9Sb3V0ZXMnKSlcclxuICAgIC5ydW4ocmVxdWlyZSgnLi9SdW4nKSlcclxuICAgIC5zZXJ2aWNlKCdDb25maWcnLCByZXF1aXJlKCcuL0NvbmZpZy5qcycpKVxyXG4gICAgLmZhY3RvcnkoJ1VzZXInLCByZXF1aXJlKCcuL1VzZXIuanMnKSlcclxuICAgIC5kaXJlY3RpdmUoJ2RkSGVhZGVyJywgcmVxdWlyZSgnLi9EZEhlYWRlci5qcycpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCByZXF1aXJlKCcuL0hlYWRlckN0cmwnKSlcclxuICAgIC5jb250cm9sbGVyKCdGaWxlc0N0cmwnLCByZXF1aXJlKCcuL0ZpbGVzQ3RybCcpKVxyXG4gICAgLmNvbnRyb2xsZXIoJ01hY2hpbmVzQ3RybCcsIHJlcXVpcmUoJy4vTWFjaGluZXNDdHJsJykpXHJcbiAgICAuY29udHJvbGxlcignUHJvZmlsZXNDdHJsJywgcmVxdWlyZSgnLi9Qcm9maWxlc0N0cmwnKSk7Il19
