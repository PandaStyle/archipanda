'use strict';

angular.module('tumblr', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/tumblr', {
            templateUrl: 'views/tumblr/tumblr.html',
            controller: 'tumblrCtrl'
        });
    }])

    .factory('tumblrService', function($http){
        return {
            getPosts: function(offset, size) {
                return $http.get('/getposts/' + offset+ '/' + size);
            }
        }
    })

    .controller('tumblrCtrl', function(tumblrService) {

        window.reblogsKeys = [];

        var postsOffset = 0,
            serverUrl = "",
            getPostTriggered = true,
            smallestColumnOffset,
            postItemCount = 40,
            a = new Date(),
            postIds = [],
            appendedItems = [],
            DELAYVALUE = 0.05,
            postTime;

        //document.addEventListener('DOMContentLoaded', function () {
            console.log('domready in ' + ((new Date().getTime()) - (a.getTime()))+ "ms");

            getPosts(postsOffset);

            $(window).on("scrollstart", function(){ $('body').addClass('disable-hover');});
            $(window).on("scrollstop", scrollHandler);
        //});


        function getPosts(o){
            postTime = new Date();

            NProgress.start();

            if(o == 0){
                salvattore.register_grid($('.tumblr')[0]);
            }

            tumblrService.getPosts(o, 40)
                .then(function(results) {
                   // debugger;
                    console.log(results.data.length + ' image with offset ' + o + ' in ' + ((new Date().getTime()) - (postTime.getTime())) + ' ms');
                    appendPosts(results.data);
                }, function(err) {
                    console.log("error happended with the tumblrService call: ". err);

                });
        }


        function appendPosts(results){
            var counter = 0;
            appendedItems = [];


            for(var i=0; i < results.length; i++){
                postIds.push(results[i].id);
                if(_.where(results[i].photos[0].alt_sizes, {width: 400}).length>0){
                    var url = _.where(results[i].photos[0].alt_sizes, {width: 400})[0].url;
                } else if(_.where(results[i].photos[0].alt_sizes, {width: 399}).length>0){
                    var url = _.where(results[i].photos[0].alt_sizes, {width: 399})[0].url;
                } else {
                    console.log("Image doesn't have 400 or 399 width", results[i], " using size " + results[i].photos[0].alt_sizes[0].width);
                    var url = results[i].photos[0].alt_sizes[0].url;
                }

                var item = $('<div class="box item">\
                                <a class="overlay" href="' + results[i].post_url + '" target="_blank">\
                                <div class="lay"></div>\
                                <i class="flaticon-logotype1 nameicon"></i> <span class="blogname">' + results[i].blog_name  + '</span> \
                                </a>\
                                <img src="' + url + '" alt=""/> \
                                </div>');

                item.imagesLoaded()
                    .done(function(c,b){
                        salvattore.append_elements($('.tumblr')[0], [c.elements[0]]);

                        var delay = DELAYVALUE * counter;

                        $(c.elements[0]).css({"transition-delay": delay + "s","-webkit-transition-delay": delay + "s"})

                        appendedItems.push($(c.elements[0]));

                        counter++;
                        NProgress.inc();
                        if(counter == results.length){
                            onFinish();
                        }
                    })
                    .fail (function( instance ) {
                    console.log('imagesLoaded failed for ', instance);
                });

                window.reblogsKeys.push(results[i].reblog_key);
            }
        }

        function onFinish(){
            $('.loading').remove();

            var c = _.sortBy(postIds);
            for(var i = 0; i < c.length; i ++){
                if([i] == c[i++]){
                    console.log('IDENTITITI');
                }
            }

            for(var i =0; i < appendedItems.length; i++){
                appendedItems[i].css({"-webkit-transform": "translateY(0)","-moz-transform": "translateY(0)","-ms-transform": "translateY(0)","-o-transform": "translateY(0)",transform: "translateY(0)",opacity: 1});
            }

            $(window).on("scrollstop", scrollHandler);

            console.log("images loaded and appended, in " + ((new Date().getTime()) - (postTime.getTime()))+ "ms");
            NProgress.done();

            getPostTriggered = true;
            postsOffset += postItemCount;

            setColumnHeights();
            checkForDuplicates();
        };

        function scrollHandler() {
            $('body').removeClass('disable-hover');

            var b = $(window).scrollTop() + $(window).height();
            if (b >= (smallestColumnOffset - ($(document).height()/5)) || b >= $(document).height() ) {
                $(window).off("scrollstop");

                if(getPostTriggered){
                    getPostTriggered = false;
                    getPosts(postsOffset);

                }
            };
        }

        function setColumnHeights() {
            for (var b = $(".column"), c = null, d = 0, e = b.length; e > d; d++) {
                var f = $(b[d]);
                null == c ? (c = f.height(), smallestColumnOffset = f.children("div").last().offset().top + f.children("div").last().height() / 2) : c > f.height() && (c = f.height(), smallestColumnOffset = f.children("div").last().offset().top + f.children("div").last().height() / 2)
            }
        }

        function checkForDuplicates(){
            var arr = window.reblogsKeys;
            var sorted_arr = arr.sort(); // You can define the comparing function here.
            // JS by default uses a crappy string compare.
            var results = [];
            for (var i = 0; i < arr.length - 1; i++) {
                if (sorted_arr[i + 1] == sorted_arr[i]) {
                    results.push(sorted_arr[i]);
                }
            }

            console.log("Duplicate reblog keys so far: ", results);
            console.log("Duplicate length: ", results.length);

        }




        
    });