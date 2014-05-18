angular.module('dotdeploy').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('files.html',
    "files"
  );


  $templateCache.put('header.html',
    "<header class=\"navbar navbar-inverse navbar-fixed-top\"><div class=\"container\"><div class=\"navbar-header\"><a class=\"navbar-brand\" href=\"/\">DotDeploy</a></div><div class=\"collapse navbar-collapse\"><ul class=\"nav navbar-nav\" ng-show=\"user.profile\"><li ng-class=\"{'active': $route.current.templateUrl === 'files.html'}\"><a href=\"#/files\"><i class=\"fa fa-file\"></i> Files</a></li><li ng-class=\"{'active': $route.current.templateUrl === 'machines.html'}\"><a href=\"#/machines\"><i class=\"fa fa-desktop\"></i> Machines</a></li><li ng-class=\"{'active': $route.current.templateUrl === 'profiles.html'}\"><a href=\"#/profiles\"><i class=\"fa fa-user\"></i> Profiles</a></li></ul><div class=\"login navbar-right\" ng-hide=\"user.auth.status.signed_in\"><div id=\"login-gplus\"></div></div><div class=\"profile navbar-right btn-group\" ng-show=\"user.profile\"><button class=\"btn navbar-btn btn-default dropdown-toggle\" data-toggle=\"dropdown\"><img ng-src=\"{{user.profile.image.url}}\"> {{user.profile.displayName}} <i class=\"fa fa-caret-down\"></i></button><ul class=\"dropdown-menu\" role=\"menu\"><li><a href=\"javascript:void()\" ng-click=\"user.logout()\">Logout</a></li></ul></div></div></div></header>"
  );


  $templateCache.put('home.html',
    "<div class=\"home\"><div class=\"hero\"><h1>dotdeploy</h1><p>Store, edit, manage, sync your dotfiles</p><a href=\"https://github.com/dotdeploy/DotDeploy\" class=\"btn btn-success\"><i class=\"fa fa-github-square\"></i> GitHub</a></div></div>"
  );


  $templateCache.put('machines.html',
    "machines"
  );


  $templateCache.put('profiles.html',
    "profiles"
  );

}]);