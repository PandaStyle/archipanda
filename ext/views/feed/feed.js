'use strict';

angular.module('feed', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/feed', {
            templateUrl: 'views/feed/feed.html',
            controller: 'feedCtrl'
        });
    }])

    .controller('feedCtrl', [function() {
        console.log("hello from feed");

        jQuery.ajax('/all')
            .done(function(res) {
                $('.feed').html(res);
            })
            .fail(function() {
                alert( "error" );
            });
    }]);