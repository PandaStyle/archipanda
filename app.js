var Hapi = require('hapi');
var Good = require('good');
var feed = require('feed-read');
var _ = require('lodash');
var moment = require('moment');
var cheerio = require('cheerio');
var path = require('path');
var Inert = require('inert');
var FeedParser = require('feedparser');
var req = require('request');
var CronJob = require('cron').CronJob;

var FeedService = require('./services/feed/feed.js');
var TumblrService = require('./services/tumblr/tumblr.js');
var instagram = require('./services/instagram/instagram.js');


var http = require('http');



// Create a server with a host and port
var server = new Hapi.Server();
server.connection({
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

server.route({
    method: 'GET',
    path:'/ping',
    handler: function (request, reply) {
        reply("pong hahaha");
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
});


server.route({
    method: 'GET',
    path: '/website/{param*}',
    handler: {
        directory: {
            path: path.join(__dirname, '/website'),
            index: true
        }
    }
});




server.route({
    method: 'GET',
    path:'/feed/river/{type}',
    handler: function (req, reply) {
        FeedService.getFeedFromRiver(req.params.type, function(err, res, body) {
            if (err) {
                console.log("Error happened during getFeedfromRiver: ", err);
            }

            return reply(
                {
                    res: res
                });
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
    path:'/insta/{offset}/{size}',
    handler: function (request, reply) {
        var offset = request.params.offset,
            limit = request.params.size;


        instagram.getPosts(offset, limit)
            .then(res => { reply(res)})
            .catch(err => { throw err; reply(err)})
    }
});



var job = new CronJob('0 */15 * * * *', function() {
        instagram.collectAPIAndSaveToDB()
    },
    null,
    true /* Start the job right now */
);

server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
});
