'use strict';

angular.module('instagram', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/instagram', {
            templateUrl: 'views/instagram/instagram.html',
            controller: 'instagramCtrl'
        });
    }])

    .controller('instagramCtrl', [function() {
        console.log("hello from insta");
    }]);