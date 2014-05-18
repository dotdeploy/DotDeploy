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