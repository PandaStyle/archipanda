var Hapi = require('hapi');
var Good = require('good');
var feed = require('feed-read');
var _ = require('lodash');
var moment = require('moment');
var cheerio = require('cheerio');
var Path = require('path');
var Inert = require('inert');
var FeedParser = require('feedparser');


var FeedService = require('./services/feed/feed.js');
var TumblrService = require('./services/tumblr/tumblr.js');
var InstagramService = require('./services/instagram/instagram.js');


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
});




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

server.route({
    method: 'GET',
    path:'/feed/{id}',
    handler: function (request, reply) {
        FeedService.getFeedAll(function(err, res){
            if (err) {
                console.log("Error happened during getFeedAll: ", error);
            }

            return reply(res);
        });
    }
});

server.route({
    method: 'GET',
    path:'/feed/all',
    handler: function (req, reply) {
        FeedService.getFeedAll(function(err, res){
            if (err) {
                console.log("Error happened during getFeedAll: ", err);
            }

            return reply.view('index', {res: _.sortByOrder(res, function(item) {return new Date(item.date);}, ['desc'])});
        });
    }
});


server.route({
    method: 'GET',
    path:'/getposts/{offset}/{size}',
    handler: function (request, reply) {
        TumblrService.user.dashboard({offset: request.params.offset, limit: request.params.size, type: 'photo' }, function (error, response) {
            if (error) {
                throw new Error(error);
            }

            var u = _.uniq(response.posts, 'reblog_key')
            reply(u);
        });
    }
});

server.route({
    method: 'GET',
    path:'/instagram/all',
    handler: function (req, reply) {
        InstagramService.user_media_recent('1114817103', function(err, medias, pagination, remaining, limit) {

        if (err) {
                console.log("Error happened during instagram: ", err);;
            }

            reply(medias);
        });
    }
});







server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
});