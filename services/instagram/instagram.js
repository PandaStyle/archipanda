'use strict'
var _ = require('lodash');
var async = require('async');
var ig = require('instagram-node').instagram();
var Post = require('./Post.js');
var mongoose = require('mongoose');
var instagramAccounts = require('./instagramAccounts')

mongoose.Promise = require("bluebird");
mongoose.connect('mongodb://127.0.0.1:27017/test');

//access token form here http://instagramwordpress.rafsegat.com/docs/get-access-token/
//or from here: http://www.shopifythemes.net/pages/instagram/
ig.use({ access_token: '1114817103.d8d1d50.c032a4b704e04410bdd186939b7b6789' })

_.mixin({
    'findByValues': function(collection, property, values) {
        return _.filter(collection, function(item) {
            return _.contains(values, item[property]);
        });
    }
});


let collectAPIAndSaveToDB = () => {
    console.log("Collectind data from Instagram API at ", new Date())

    var posts = [];

    async.each(instagramAccounts, function(account, callback) {
            ig.user_media_recent(account.id, (err, medias, pagination, remaining, limit) =>{
                console.log(medias)
                medias.forEach(item => {
                    posts.push({
                        id: item.id,
                        type: item.type,
                        comments: item.comments.count,
                        created_time: item.created_time,
                        link: item.link,
                        likes: item.likes.count,
                        caption: item.caption,
                        user: item.user,
                        image: item.images.standard_resolution
                    });
                })
                callback();
            })
        },
        function(err){
            if( err )
                console.error(err)

            let p = Post.find({})
                .select('id -_id')
                .then( resFromDB => {

                    let postIdsAPI = _.map(posts, 'id')
                    let postIdsDB =  _.map(resFromDB, 'id');


                    //order is important here
                    let newPostIds = _.difference(postIdsAPI, postIdsDB);

                    return newPostIds;
                })
                .then(newPostIds => {
                    //console.log("new poest ids: ", newPostIds);
                    let newPosts = _.findByValues(posts, "id", newPostIds)

                    if(newPosts.length == 0)
                        console.log("No new posts from API")
                    else {
                        Post.insertMany(newPosts)
                            .then( mongooseDocuments => {
                                console.log("insert succeed, posts length: " + mongooseDocuments.length + " items");
                            })
                            .catch(function(err) {
                                console.error(err);
                            })
                    }
                })
                .catch(function(err) {
                    console.error(err);
                })
        }
    )
}

let getPosts = (offset, size) => {

    let s = parseInt(size),
        o = parseInt(offset);

    return Post.find({})
        .sort({created_time:-1})
        .skip(o)
        .limit(s)
}

module.exports = {
    collectAPIAndSaveToDB: collectAPIAndSaveToDB,
    getPosts: getPosts
}


