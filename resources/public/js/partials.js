angular.module('dotdeploy').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('DdUploader.html',
    "<input type=\"file\"><button ng-click=\"uploader.upload()\">Upload</button>"
  );


  $templateCache.put('file.html',
    "<div class=\"files editor\"><h1>{{machines.getSelectedName()}}</h1><div class=\"form-group\"><label>path (relative to ~)<input type=\"text\" class=\"form-control\" ng-model=\"files.selected.path\" placeholder=\".bashrc\"></label></div><textarea ui-codemirror=\"files.editorOptions\" ng-model=\"files.fileContents\"></textarea><button class=\"btn btn-primary\" ng-show=\"files.selected[file-id]\" ng-click=\"files.save()\"><i class=\"fa fa-save\"></i> Save</button> <button class=\"btn btn-primary\" ng-hide=\"files.selected[file-id]\" ng-click=\"files.upload()\"><i class=\"fa fa-upload\"></i> Upload</button></div>"
  );


  $templateCache.put('files.html',
    "<div class=\"files browser\"><h1>Your Files <a href=\"#/files/new\" class=\"btn btn-success\"><i class=\"fa fa-plus-square\"></i> New File</a></h1><ul><li ng-repeat=\"file in files.list\"><a href=\"/#files/{{file['file-id']}}\">{{file.name}}</a></li></ul></div>"
  );


  $templateCache.put('header.html',
    "<header class=\"navbar navbar-inverse navbar-fixed-top\"><div class=\"container\"><div class=\"navbar-header\"><a class=\"navbar-brand\" href=\"/\">DotDeploy</a></div><div class=\"collapse navbar-collapse\"><ul class=\"nav navbar-nav\" ng-show=\"user.profile\"><li ng-class=\"{'active': $route.current.templateUrl === 'files.html'}\"><a href=\"#/files\"><i class=\"fa fa-file\"></i> Files</a></li><li ng-class=\"{'active': $route.current.templateUrl === 'machines.html'}\"><a href=\"#/machines\"><i class=\"fa fa-desktop\"></i> Machines</a></li><li ng-class=\"{'active': $route.current.templateUrl === 'profiles.html'}\"><a href=\"#/profiles\"><i class=\"fa fa-user\"></i> Profiles</a></li><li ng-class=\"{'active': $route.current.templateUrl === 'install.html'}\"><a href=\"#/install\"><i class=\"fa fa-download\"></i> Install</a></li></ul><div class=\"login navbar-right\" ng-hide=\"user.auth.status.signed_in\"><div id=\"login-gplus\"></div></div><div class=\"profile navbar-right btn-group\" ng-show=\"user.profile\"><button class=\"btn navbar-btn btn-default dropdown-toggle\" data-toggle=\"dropdown\"><img ng-src=\"{{user.profile.image.url}}\"> {{user.profile.displayName}} <i class=\"fa fa-caret-down\"></i></button><ul class=\"dropdown-menu\" role=\"menu\"><li><a href=\"javascript:void()\" ng-click=\"user.logout()\">Logout</a></li></ul></div></div></div></header>"
  );


  $templateCache.put('home.html',
    "<div class=\"home\"><div class=\"hero\"><h1>dotdeploy</h1><p>Store, edit, manage, sync your dotfiles</p><a href=\"https://github.com/dotdeploy/DotDeploy\" class=\"btn btn-success\"><i class=\"fa fa-github-square\"></i> GitHub</a></div></div>"
  );


  $templateCache.put('install.html',
    "<div class=\"installer\"><h1>Generate install script</h1><textarea ui-codemirror=\"install.editorOptions\" ng-model=\"install.command\"></textarea></div>"
  );


  $templateCache.put('machine.html',
    "<div class=\"machines editor\"><h1>{{machines.getSelectedName()}}</h1><div class=\"form-group\"><label>Name<input type=\"text\" class=\"form-control\" ng-model=\"machines.selected.name\" placeholder=\"My Work Laptop\"></label></div><h2>Profiles</h2><div class=\"form-group\" ng-repeat=\"(profile, model) in machines.profiles\"><label>{{profile}}<input type=\"checkbox\" class=\"form-control\" ng-model=\"machines.profiles[profile]\"></label></div><button class=\"btn btn-primary\" ng-click=\"machines.saveSelected()\"><i class=\"fa fa-save\"></i> Save</button></div>"
  );


  $templateCache.put('machines.html',
    "<div class=\"machines browser\"><h1>Your Machines</h1><ul><li ng-repeat=\"machine in machines.list\"><a href=\"/#machines/{{machine['machine-id']}}\">{{machine.name || machine.hostname}}</a></li></ul></div>"
  );


  $templateCache.put('profile.html',
    "<div class=\"profiles editor\"><h1></h1><ul><li ng-repeat=\"file in files.list\"><a href=\"/#files/{{file['file-id']}}\">{{file.name}}</a></li></ul></div>"
  );


  $templateCache.put('profiles.html',
    "<div class=\"profile browser\"><h1>Your Profiles <a href=\"#/profiles/new\" class=\"btn btn-success\"><i class=\"fa fa-plus-square\"></i> New Profile</a></h1><ul><li ng-repeat=\"profile in profiles.list\"><a href=\"/#profiles/{{profile['profile-id']}}\">{{profile.name}}</a></li></ul></div>"
  );


  $templateCache.put('upload.html',
    "<div class=\"upload\" dd-uploader=\"\"></div>"
  );

}]);
