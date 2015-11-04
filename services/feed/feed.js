var _ = require('lodash');
var feed = require('feed-read');
var cheerio = require('cheerio');
var moment = require('moment');
var request = require('request');

var rssUrls = require('./urls.js').rssUrls;
var mixChimpUrl = require('./urls.js').mixChimpUrl;
var riverUrl = require('./urls.js').riverUrl;

var exported = module.exports = {};


exported.getFeedFromRiver = function(callback){
    var feedtime = new Date();

    request.get({url: riverUrl, json:true}, function (err, response, body) {
        if (err) {
            console.log("Error happened during getFeedfromRiver: ", err);
            callback(err, response)
        }

        if (!err && response.statusCode == 200) {
            console.log(" ------ Success --------"); // Show the HTML for the Google homepage.

            _.forEach(body["updatedFeeds"]["updatedFeed"], function(elem, key){
                if(elem.item.lenght > 1){
                    console.log("more than 1 item in feed element");
                }
            });

            var res = _.map(body["updatedFeeds"]["updatedFeed"], function(elem){
                var item = elem.item[0];

                return {
                    id: item.id,
                    summary: item.body,
                    title: item.title,
                    link: item.link,
                    feed: elem.feedTitle.split(' ')[0],
                    published: item.pubDate,
                    image: item.image.src,
                    diff: moment.duration(moment().diff(moment(new Date(item.pubDate)))).humanize(),

                    websiteUrl: elem.websiteUrl,
                    websiteDesc: elem.feedDescription,
                    whenLastUpdate: elem.whenLastUpdate
                }
            });

            console.log("callback in " +  ((new Date().getTime()) - (feedtime.getTime())) + ' ms');
            callback(err, res, body);

        }

    });


};

exported.getFeedAll  = function(callback){
    var feedtime = new Date();
     feed(mixChimpUrl, function (err, result) {
         console.log("Feed data arrived in " +  ((new Date().getTime()) - (feedtime.getTime())) + ' ms');
        if (err) {
            console.log("Error happened during getFeed: ", err);
            callback(err, res)
        }
        
        var res = _.map(result, function(item){
            var $ = cheerio.load(item.content);
            var $summary = cheerio.load(item.summary, {xmlMode: true});
            return {
                id: item.id,
                summary: item.summary,
                title: item.title,
                link: item.link,
                date: item.published,
                feed: item.feed,
                published: item.published,
                image: $('img')[0] ? $('img')[0].attribs.src : "ph.jpg",
                diff: moment.duration(moment().diff(moment(new Date(item.published)))).humanize()
            }
        });
        var res = _.take(_.map(result, function(item){
                        var $ = cheerio.load(item.content);
                        return {
                            title: item.title,
                            link: item.link,
                            date: item.published,
                            feed: item.feed,
                            published: item.published,
                            image: $('img')[0] ? $('img')[0].attribs.src : "ph.jpg",
                            diff: moment.duration(moment().diff(moment(new Date(item.published)))).humanize()
                        }
                 }), 10);

         console.log("callback in " +  ((new Date().getTime()) - (feedtime.getTime())) + ' ms');
        callback(err, res);
    });
};

exported.getNoMap  = function(callback){
    feed(mixChimpUrl, function (err, result) {
        if (err) {
            console.log("Error happened during getFeed: ", error);
            callback(err, result)
        }
        callback(err, result);
    });
};

exported.getFeedById  = function(id, callback){
    feed(_.find(rssUrls, { 'id': id}).url, function (err, result) {
        if (err) {
            console.log("Error happened during getFeedById: ", error);
            callback(err, res)
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

        callback(err, res)
    });
};




