'use strict'

var Hapi = require('hapi');
var Good = require('good');
var mongoose = require('mongoose');
var feed = require('feed-read');
var _ = require('lodash');
var moment = require('moment');
var cheerio = require('cheerio');
var path = require('path');
var Inert = require('inert');
var FeedParser = require('feedparser');
var req = require('request');
var CronJob = require('cron').CronJob;
var Joi = require('joi');

var FeedService = require('./services/feed/feed.js');
var TumblrService = require('./services/tumblr/tumblr.js');
var instagram = require('./services/instagram/instagram.js');

var buildingService = require('./services/lite/buildingService.js')

mongoose.connect('mongodb://127.0.0.1:27017/test');

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
    path:'/feed/{type}/{size}',
    handler:  (req, reply) => {
        console.log( req.params.size);
        
        FeedService.getFeedFromDB(req.params.type, parseInt(req.params.size)).then( (res) => {
            reply(res)
        }).catch( error => {
            console.error(error);
        })
    }
});

server.route({
    method: 'POST',
    path:'/feed',
    handler:  (req, reply) => {
        let type = req.payload.type,
            size = req.payload.size;

        let excludedFeeds =  req.payload.excluded ? JSON.parse(req.payload.excluded) : [];

        FeedService.getFeedFromDBEx(type, parseInt(size), excludedFeeds).then( (res) => {
            reply(res)
        }).catch( error => {
            console.error(error);
        })
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


server.route({
    method: 'POST',
    path:'/building',
    config: {
        validate: {
            payload: {
                link: Joi.string().required(),
                img: Joi.string().required(),
                title: Joi.string().required(),
                source: Joi.string().required()
            }
        }
    },
    handler: function (request, reply) {
        buildingService.saveBuilding(request.payload)
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
