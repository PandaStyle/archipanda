'use strict'

var _ = require('lodash');
var feed = require('feed-read');
var moment = require('moment');
var request = require('request');

var urls = require('./urls.js');
var feedAccounts = require('./feedAccounts')

var DB = require('./db.js')


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

                    var image = null;

                    if(_item.imageFromEnclosure) {
                        image =  _item.imageFromEnclosure;
                    } else if(_item.imageFromMeta) {
                        image = _item.imageFromMeta;
                    } else if(_item.imageFromIneed && _item.imageFromIneed.src){
                        image = _item.imageFromIneed.src;
                    } else {
                        console.log("No image represented for item: ", _item.link);
                        image =  image_placeholder_url;
                    }

                    //take out "" and nulls, and {src: ...} s
                    //SITE SPECIFIC IMPLEMENTATION
                    if(image && image.src) {
                        if (_item.feedId == 13) {
                            image = "http://abduzeedo.com" + image.src;
                        } else {
                            image = image.src
                        }
                    } else if(image && image.url){
                            image = image.url
                    } else if (image == "" || !item.image) {
                        image = null;
                    } else {
                        console.log("No image url after pipe: ", _item.link)
                    }

                    return image;
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
                        published: new Date(item.pubDate),
                        image: getImage(item),
                        diff: moment.duration(moment().diff(moment(new Date(item.pubDate)))).humanize(),

                        websiteUrl: elem.websiteUrl,
                        websiteDesc: _.find(feedAccounts, { 'url': elem.websiteUrl}) ? _.find(feedAccounts, { 'url': elem.websiteUrl}).name : elem.feedDescription,
                        whenLastUpdate: elem.whenLastUpdate
                    });

                })

            });

            //sort
            var sorted = _.sortBy(res, 'published').reverse();


            console.log("callback in " +  ((new Date().getTime()) - (feedtime.getTime())) + ' ms');
            callback(err, sorted, body);

        }

    });
};

const normalizeImage =  (item) => {
    var image = null

    if(item.image && item.image.src) {
        if (item.feedId == 13) {
            image = "http://abduzeedo.com" + item.image.src;
        } else {
            image = item.image.src
        }
    } else if(image && image.url){
        image = item.image.url
    } else if (image == "" || !item.image) {
        image = null;
    } else {
        console.log("No image url after pipe: ", item.link)
    }

    return image;
}

exported.getFeedFromDB = (type, limit) => {
    return DB.getFeedByType(type, limit).then(res => {
        return res.map(i => {
            var j = i.toObject();

            //TODO
            j.diff = moment.duration(moment().diff(moment(j.pubDate))).humanize()
            j.feed = _.find(feedAccounts, { 'id': j.feedId}).name

            j.image = normalizeImage(j);

            return j
        })
    })
}




exported.getAll = DB.getAll;




