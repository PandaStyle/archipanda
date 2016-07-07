const
    _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    Promise = require('bluebird'),

    feedTypes = require('./feedTypes');



const feedSchema = new Schema({
    _id: String
}, {strict: false});

const Feed = mongoose.model('Feed', feedSchema);


const getFeedByType = (type) => {

    var feedIds = feedTypes.get(type);

    console.log(type)
    return feedIds;
}

module.exports = {
    getFeedByType: getFeedByType
}
