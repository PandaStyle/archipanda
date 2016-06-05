var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var postSchema = new Schema({
    id: { type: String, required: true, unique: true },
    type: String,
    comments: Number,
    created_time: String,
    link: String,
    likes: Number,
    caption: Object,
    user: Object,
    image: Object
});
var Post = mongoose.model('Post', postSchema);

module.exports = Post;
