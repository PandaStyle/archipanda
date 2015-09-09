var Hapi = require('hapi');
var Good = require('good');
var async = require('async');
var feed = require('feed-read');
var _ = require('lodash');
var moment = require('moment');

var rssUrls = require('./rss/urls.js');


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
           /* var res = _.map(_.flattenDeep(result), function(item){
                return {
                    title: item.title,
                    link: item.link,
                    date: item.published,
                    feed: item.feed
                }
            });*/

            reply(result);
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
            /* var res = _.map(_.flattenDeep(result), function(item){
             return {
             title: item.title,
             link: item.link,
             date: item.published,
             feed: item.feed
             }
             });*/

            return reply.view('index', {res: result});
        });
    }
});

server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        // Render the view with the custom greeting
        var data = {
            title: 'This is Index!',
            message: 'Hello, World. You crazy handlebars layout'
        };

        return reply.view('index', data);
    }
});

server.route({
    method: 'GET',
    path:'/all',
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