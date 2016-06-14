/**
 * Created by zsnemeth on 6/14/16.
 */
var Promise = require("bluebird");
var Building = require('./Building');
var mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

const saveBuilding = payload => {
    var b = new Building(payload)

    return b.save(payload)
        .then(res => res)
        .catch(err => {throw err})
}

module.exports = {
    saveBuilding: saveBuilding
}