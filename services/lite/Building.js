var mongoose = require('mongoose');
var uuid = require('node-uuid');

var Schema = mongoose.Schema;

var buildingSchema = new Schema({
    id: { type: String, default: uuid.v1 },

    link: String,
    img: String,
    title: String,
    source: String,

    caption: String,

    insert_date: { type: Date, default: Date.now }
});


var Building = mongoose.model('Building', buildingSchema);

module.exports = Building;
