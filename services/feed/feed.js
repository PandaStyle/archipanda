var _ = require('lodash');
var feed = require('feed-read');
var moment = require('moment');
var request = require('request');

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





