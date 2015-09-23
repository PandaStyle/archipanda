'use strict';

angular.module('instagram', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/instagram', {
            templateUrl: 'views/instagram/instagram.html',
            controller: 'instagramCtrl'
        });
    }])

    .factory('instagramService', function($http){
        return {
            getPosts: function(offset, size) {
                return $http.get('/instagram/all');
            }
        }
    })

    .controller('instagramCtrl', function(instagramService) {

        instagramService.getPosts()
            .then(function(res) {
                // debugger;

                appendPosts(res);
            }, function(err) {
                console.log("error happended with the tumblrService call: ". err);
            });

        function appendPosts(r){
            var results = r.data.data;
            var grid = $('.g');


            for(var i=0; i < results.length; i++){

                var item = $('<li class="box item">\
                                <a class="overlay">\
                                <div class="lay"></div></a>\
                                <img src="' + results[i].images.standard_resolution.url + '" alt=""/> \
                            </li>');

                grid.append(item);
            }


        }
    })