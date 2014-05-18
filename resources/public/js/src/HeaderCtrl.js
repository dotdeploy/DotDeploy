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