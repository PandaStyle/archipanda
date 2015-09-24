'use strict';

angular.module('feed', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/feed', {
            templateUrl: 'views/feed/feed.html',
            controller: 'feedCtrl'
        });
    }])

    .factory('feedService', function($http){
        return {
            getPosts: function(offset, size) {
                return $http.get('/feed/all');
            }
        }
    })

    .controller('feedCtrl', function(feedService) {

        salvattore.register_grid($('.feed')[0]);

        getPosts()

        function getPosts() {
            feedService.getPosts()
                .then(function (results) {


                    appendPosts(results.data.res);
                }, function (err) {
                    console.log("error happended with the tumblrService call: ".err);

                });
        }

        function appendPosts(results){
            _.each(results, function(value, key, list){
                var item = $('<a href="" class="tile loading">\
                               <div class="tile-image"><img src="' + value.image +'" alt=""/></div>\
                            </a>');

                salvattore.append_elements($('.feed')[0], [item[0]]);
                item.imagesLoaded()
                    .done(function(imgl) {
                        $(imgl.elements[0]).removeClass('loading');
                    });
            });

        }
    });

/*<div class="tile-title-holder">\
 <h2 class="tile-title">' + value.title + '</h2>\
 </div>\
 <div class="tile-date-holder">\
 <div class="tile-date">' + value.diff + ' ago</div>\
 </div>\*/