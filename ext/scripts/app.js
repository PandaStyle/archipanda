    angular.module('archip', [
        'ngRoute',
        'feed',
        'tumblr',
        'instagram'
    ]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/feed'});
    }])
    .controller('atdController', ['$scope', '$location', function($scope, $location) {

            $(window).on("scrollstart", function(){ $('body').addClass('disable-hover');});
            $(window).on("scrollstop", function(){ $('body').removeClass('disable-hover');});

            $scope.isActive = function (viewLocation) {
                return viewLocation === $location.path();
            };

            $('#toggle').click(function() {
                $(this).toggleClass('active');
                $('#overlay').toggleClass('open');
            });
    }]);

