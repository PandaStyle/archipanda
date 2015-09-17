'use strict';

angular.module('tumblr', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/tumblr', {
            templateUrl: 'views/tumblr/tumblr.html',
            controller: 'tumblrCtrl'
        });
    }])

    .controller('tumblrCtrl', [function() {
        console.log("hello from tumblr!");
    }]);