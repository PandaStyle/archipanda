var _ = require('lodash');
var feed = require('feed-read');
var cheerio = require('cheerio');
var moment = require('moment');

var rssUrls = require('./urls.js').rssUrls;
var mixChimpUrl = require('./urls.js').mixChimpUrl;

var exported = module.exports = {};


exported.getFeedAll  = function(callback){
     feed(mixChimpUrl, function (err, result) {
        if (err) {
            console.log("Error happened during getFeed: ", error);
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
                image: $('img')[0] ? $('img')[0].attribs.src : "ph.jpg",
                diff: moment.duration(moment().diff(moment(new Date(item.published)))).humanize()
            }
        });

        callback(err, res);
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




