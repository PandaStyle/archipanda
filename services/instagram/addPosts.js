'use strict'

var _ = require('lodash');
var Promise = require("bluebird");
var rp = require('request-promise');
var instagramAccounts = require('./instagramAccounts')
var Post = require('./Post.js');
var mongoose = require('mongoose');


const INITIAL_COUNT = 20;


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


const insertPosts = posts =>{

    var posts = _.flatten(posts);

    posts.map( item => {
        item.username = _.find(instagramAccounts, {id: item.owner.id}).username
        item.profile_picture = _.find(instagramAccounts, {id: item.owner.id}).profile_picture
    })

    return Post.insertMany(posts)
        .then( mongooseDocuments => {
            console.log("Inserted " + posts.length + " new posts, overall count: " + mongooseDocuments.length + " posts");
        })
        .catch(function(err) {
            console.error(err);
        })
}


Promise.map(instagramAccounts, function(account) {
    // Promise.map awaits for returned promises as well.
    return getImages(account.id, INITIAL_COUNT);
})
    .then(insertPosts)
    .catch(function (err) {
        throw err
    });


