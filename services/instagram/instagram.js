'use strict'

var Promise = require("bluebird");
var _ = require('lodash');
var rp = require('request-promise');
var Post = require('./Post.js');
var mongoose = require('mongoose');
var instagramAccounts = require('./instagramAccounts')

mongoose.Promise = require('bluebird');


_.mixin({
    'findByValues': function(collection, property, values) {
        return _.filter(collection, function(item) {
            return _.contains(values, item[property]);
        });
    }
});

const getImages = (user, count) => {

    var headers = {
        'origin': 'https://www.instagram.com',
        'accept-language': 'en-US,en;q=0.8,hu;q=0.6,nl;q=0.4',
        'x-requested-with': 'XMLHttpRequest',
        'cookie': 'csrftoken=0;',
        'x-csrftoken': '0',
        'pragma': 'no-cache',
        'x-instagram-ajax': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'cache-control': 'no-cache',
        'authority': 'www.instagram.com',
        'referer': 'https://www.instagram.com'
    };

    var dataString = 'q=ig_user('+user+')+%7B+media.first('+count+')+%7B%0A++count%2C%0A++nodes+%7B%0A++++caption%2C%0A++++code%2C%0A++++comments+%7B%0A++++++count%0A++++%7D%2C%0A++++date%2C%0A++++dimensions+%7B%0A++++++height%2C%0A++++++width%0A++++%7D%2C%0A++++display_src%2C%0A++++id%2C%0A++++is_video%2C%0A++++likes+%7B%0A++++++count%0A++++%7D%2C%0A++++owner+%7B%0A++++++id%0A++++%7D%2C%0A++++thumbnail_src%2C%0A++++video_views%0A++%7D%2C%0A++page_info%0A%7D%0A+%7D&ref=users%3A%3Ashow';

    var options = {
        url: 'https://www.instagram.com/query/',
        method: 'POST',
        headers: headers,
        body: dataString,
        json: true
    };


    return rp(options)
        .then(function (parsedBody) {
            return parsedBody.media.nodes
        })
        .catch(function (err) {
            throw err
        });
}



const collectAPIAndSaveToDB = () => {
    console.log("Collectind data from Instagram API at ", new Date())


    Promise.map(instagramAccounts, function(account) {
        // Promise.map awaits for returned promises as well.
        return getImages(account.id, 3);
    })
    .then(posts => {
        let p = Post.find({})
            .then( resFromDB => {


                let postIdsAPI = _.map(_.flatten(posts), 'id')
                let postIdsDB =  _.map(resFromDB, 'id');


                //order is important here
                let newPostIds = _.difference(postIdsAPI, postIdsDB);

                //new post objects from the API
                let newPosts = _.findByValues(_.flatten(posts), "id", newPostIds)


                if(newPosts.length == 0)
                    console.log("No new posts from API")
                else {
                    
                    //add username to the Post object
                    newPosts.map( item => {
                        item.username = _.find(instagramAccounts, {id: item.owner.id}).name
                        item.profile_picture = _.find(instagramAccounts, {id: item.owner.id}).profile_picture
                    })

                    Post.insertMany(newPosts)
                        .then( mongooseDocuments => {
                            console.log("Inserted " + newPosts.length + " new posts, overall count: " + mongooseDocuments.length + " posts");
                        })
                        .catch(function(err) {
                            console.error(err);
                        })
                }
            })
            .catch(function(err) {
                throw(err);
            })
    })
    .catch(function (err) {
        throw err
    })

}

let getPosts = (offset, size) => {

    let s = parseInt(size),
        o = parseInt(offset);

    return Post.find({})
        .sort({date:-1})
        .skip(o)
        .limit(s)
}

module.exports = {
    collectAPIAndSaveToDB: collectAPIAndSaveToDB,
    getPosts: getPosts
}


