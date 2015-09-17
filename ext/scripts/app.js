    angular.module('archip', [
        'ngRoute',
        'feed',
        'tumblr',
        'instagram'
    ]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/feed'});
    }]);