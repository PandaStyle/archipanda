var _ = require('lodash');
var feed = require('feed-read');
var moment = require('moment');
var request = require('request');

var urls = require('./urls.js');
var feedAccounts = require('./feedAccounts')


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
        case "all": {
            url = urls.allUrl;
            break;
        }
    }

    request.get({url: url, json:true}, function (err, response, body) {
        if (err) {
            console.log("Error happened during getFeedfromRiver: ", err);
            callback(err, response)
        }

        if (!err && response.statusCode == 200) {
            _.forEach(body["updatedFeeds"]["updatedFeed"], function(elem, key){
                if(elem.item.lenght > 1){
                    console.log("more than 1 item in feed element");
                }
            });


            var res = [];

            _.forEach(body["updatedFeeds"]["updatedFeed"], function(elem){

                function getImage(_item){
                    var image_placeholder_url = "http://www.engraversnetwork.com/files/placeholder.jpg";

                    if(_item.imageFromEnclosure) {
                        return _item.imageFromEnclosure;
                    } else if(_item.imageFromMeta) {
                        return _item.imageFromMeta;
                    } else if(_item.imageFromIneed && _item.imageFromIneed.src){
                        return _item.imageFromIneed.src;
                    } else {
                        console.log("No image represented for item: ", _item.link);
                        return image_placeholder_url;
                    }
                }

                _.forEach(elem.item, function(item){

                    var ft = '';

                    if(_.find(feedAccounts, { 'url': elem.websiteUrl})){
                        ft = _.find(feedAccounts, { 'url': elem.websiteUrl}).name
                    } else if(!_.isNull(elem.feedTitle)) {
                        ft = elem.feedTitle.split('-')[0]
                    } else {
                        ft = "bdcnetwork"
                    }

                    res.push({
                        id: item.id,
                        summary: item.body,
                        title: item.title,
                        link: item.link,
                        feed: ft,
                        published: item.pubDate,
                        image: getImage(item),
                        diff: moment.duration(moment().diff(moment(new Date(elem.whenLastUpdate)))).humanize(),

                        websiteUrl: elem.websiteUrl,
                        websiteDesc: _.find(feedAccounts, { 'url': elem.websiteUrl}) ? _.find(feedAccounts, { 'url': elem.websiteUrl}).name : elem.feedDescription,
                        whenLastUpdate: elem.whenLastUpdate
                    });
                    
                })

            });

            console.log("callback in " +  ((new Date().getTime()) - (feedtime.getTime())) + ' ms');
            callback(err, res, body);

        }

    });


};





