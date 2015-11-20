var _ = require('lodash');
var feed = require('feed-read');
var moment = require('moment');
var request = require('request');

var urls = require('./urls.js');

var exported = module.exports = {};


exported.getFeedFromRiver = function(type, callback){
    var feedtime = new Date();
    var url;

    switch (type){
        case "design": {
            url = urls.designUrl;
            break;
        }
        case "technology": {
            url = urls.technologyUrl;
            break;
        }
        case "business": {
            url = urls.businessUrl;
            break;
        }
    }

    request.get({url: url, json:true}, function (err, response, body) {
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

                var image_placeholder_url = "http://www.engraversnetwork.com/files/placeholder.jpg";

                return {
                    id: item.id,
                    summary: item.body,
                    title: item.title,
                    link: item.link,
                    feed: elem.feedTitle.split(' ')[0],
                    published: item.pubDate,
                    image: item.image ? item.image.src : image_placeholder_url,
                    diff: moment.duration(moment().diff(moment(new Date(elem.whenLastUpdate)))).humanize(),

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





