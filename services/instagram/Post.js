var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var postSchema = new Schema({
    id: { type: String, required: true, unique: true },
    code: String,
    date: Number,
    dimensions: Object,
    comments: Object,
    likes: Object,
    caption: String,
    owner: Object,
    thumbnail_src: String,
    is_video: Boolean,
    display_src: String,
    
    username: String,
    profile_picture: String
});
var Post = mongoose.model('Post', postSchema);

module.exports = Post;
