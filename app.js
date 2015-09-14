var Hapi = require('hapi');
var Good = require('good');
var async = require('async');
var feed = require('feed-read');
var _ = require('lodash');
var moment = require('moment');
var cheerio = require('cheerio');
var Path = require('path');
var Inert = require('inert');
var FeedParser = require('feedparser');
var request = require('request');
var parseString = require('xml2js').parseString;

var rssUrls = require('./rss/urls.js');
var mixChimpUrl = "http://mix.chimpfeedr.com/aa681-archipanda";


// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8081,
    routes: {
        cors: {
            origin: ['*']
        }
    }
});

server.register(Inert, function () {});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true
        }
    }
});


server.register(require('vision'), function (err) {

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: './views',
        layoutPath: './views/layout'
    });
});





// Add the route
server.route({
    method: 'GET',
    path:'/rss/{id}',
    handler: function (request, reply) {


        feed(_.find(rssUrls, { 'id': request.params.id}).url, function (err, result) {
            if (err) {
                // Somewhere, something went wrong…
            }
            var res = _.map(result, function(item){

                var $ = cheerio.load(item.content);
                return {
                    title: item.title,
                    link: item.link,
                    date: item.published,
                    feed: item.feed,
                    published: item.published,
                    image: $('img')[0].attribs.src
                }
            });
            reply(res);
        });
    }
});


// Add the route
server.route({
    method: 'GET',
    path:'/rss/{id}/view',
    handler: function (request, reply) {
        feed(_.find(rssUrls, { 'id': request.params.id}).url, function (err, result) {
            if (err) {
                // Somewhere, something went wrong…
            }
            var res = _.map(result, function(item){

                var $ = cheerio.load(item.content);
                return {
                    title: item.title,
                    link: item.link,
                    date: item.published,
                    feed: item.feed,
                    published: item.published,
                    image: $('img')[0].attribs.src
                }
            });

            return reply.view('index', {res: res});
        });
    }
});

// Add the route
server.route({
    method: 'GET',
    path:'/all',
    handler: function (req, reply) {


        request(mixChimpUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                parseString(body, function (err, result) {
                    var entries = result.feed.entry;
                    var res = _.map(entries, function(item){
                  //      var $ = cheerio.load(item.content);
                        return {
                            title: item.title,
                            link: item.link,
                            date: item.published,
                            feed: item.feed,
                            published: item.published,
                    //        image: $('img')[0].attribs.src,
                            summary: item.summary
                        }
                    });
                    return reply(result);

                });
            }
        })









        /*feed(mixChimpUrl, function (err, result) {
            if (err) {
                // Somewhere, something went wrong…
            }

            return reply(result);
            //return reply.view('index', {res: res});
        });*/
    }
});



server.route({
    method: 'GET',
    path:'/manuall',
    handler: function (request, reply) {
        async.map(rssUrls, function (i, callback) {
            feed(i, callback);
        }, function (err, result) {
            if (err) {
                // Somewhere, something went wrong…
            }
            var res = _.map(_.flattenDeep(result), function(item){
                return {
                    title: item.title,
                    link: item.link,
                    date: item.published,
                    feed: item.feed,
                    diff: moment.duration(moment().diff(moment(new Date(item.published)))).humanize()
                }
            });

            reply(_.sortByOrder(res, function(item) {return new Date(item.date);}, ['desc']));
        });
    }
});






server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, function (err) {
    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});