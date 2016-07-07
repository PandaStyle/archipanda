const
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    feedTypes = require('./feedTypes');


mongoose.Promise = require('bluebird');

const feedSchema = new Schema({
    _id: String
}, {strict: false});
const Feed = mongoose.model('Feed', feedSchema);



const getFeedByType = (type, limit) => {
    var feedIds = feedTypes.get(type);

    return Feed.find({feedId: {$in: feedIds}})
                .sort({pubDate: 'asc'})
                .limit(limit)
}


module.exports = {
    getFeedByType: getFeedByType
}
