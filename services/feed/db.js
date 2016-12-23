'use strict'

const
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    feedTypes = require('./feedTypes'),
    _ = require('lodash');


mongoose.Promise = require('bluebird');

const feedSchema = new Schema({
    _id: String
}, {strict: false});
const Feed = mongoose.model('Feed', feedSchema);



const getFeedByType = (type, limit) => {
    var feedIds = feedTypes.get(type);

    return Feed.find({feedId: {$in: feedIds}})
                .sort({pubDate: 'desc'})
                .limit(limit)
}

const getFeedByTypeEx = (type, limit, exludedFeedIds) => {
    var feedIds = feedTypes.get(type);

    let substarctedFeedIdList = _.difference(feedIds, exludedFeedIds)

    return Feed.find({feedId: {$in: substarctedFeedIdList}})
        .sort({pubDate: 'desc'})
        .limit(limit)
}


module.exports = {
    getFeedByType: getFeedByType,
    getFeedByTypeEx: getFeedByTypeEx
}
