'use strict';

var s = [];

angular.module('feed', ['ngRoute'])


    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/feed/design', {
            templateUrl: 'views/feed/feed.html',
            controller: 'feedCtrl'
        });
        $routeProvider.when('/feed/technology', {
            templateUrl: 'views/feed/feed.html',
            controller: 'feedCtrl'
        });
        $routeProvider.when('/feed/business', {
            templateUrl: 'views/feed/feed.html',
            controller: 'feedCtrl'
        });
    }])

    .factory('feedService', function($http){
        return {

            getPosts: function(offset, size) {
                var type = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

                return $http.get('/feed/river/' + type);
            }
        }
    })

    .controller('feedCtrl', function(feedService) {

        var s_grid = $('.feed')[0];
        var spinner = $('.spinner');
        var imgLoad = imagesLoaded( s_grid );

        salvattore.register_grid(s_grid);

        getPosts();

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
                s.push(value.summary);

                var item = $('<div href="" class="tile">\
                                <a class="overlay" href="' + value.link + '" target="_blank">\
                                <div class="lay">\
                                </div>\
                                </a>\
                               <div class="tile-image"><img src="' + value.image +'" alt=""/></div>\
                                <header>\
                                    <div class="title">' + value.title + '</div>\
                                    <div class="summary">' + value.summary +'</div>\
                                    <div class=meta>\
                                        <span class="host">' + value.feed + '</span>\
                                        <span class="diff">' + value.diff + ' ago</span>\
                                    </div>\
                                 </header>\
                            </div>');

                salvattore.append_elements($('.feed')[0], [item[0]]);
                item.imagesLoaded()
                    .done(function(imgl) {
                        spinner.remove();
                        $(imgl.elements[0]).removeClass('loading');
                    });
            });

            imgLoad
                .on( 'done', function( instance ) {
                    console.log('DONE  - all images have been successfully loaded');
                })
                .on( 'fail', function( instance ) {
                    console.log('FAIL - all images loaded, at least one is broken');
                })
                .on( 'progress', function( instance, image ) {
                    var result = image.isLoaded ? 'loaded' : 'broken';
                    console.log( 'image is ' + result + ' for ' + image.img.src );
                })
                .on( 'always', function( instance ) {
                    console.log('ALWAYS - all images have been loaded');
                });
        }

        function getHostName(url){
            var parser = document.createElement('a');
            parser.href = url;

            return parser.hostname;
        }
    });

/*<div class="tile-title-holder">\
 <h2 class="tile-title">' + value.title + '</h2>\
 </div>\
 <div class="tile-date-holder">\
 <div class="tile-date">' + value.diff + ' ago</div>\
 </div>\*/
