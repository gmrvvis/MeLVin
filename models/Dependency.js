var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Dependency = new Schema({
    username: String,
    configured: Boolean,
    id: String,
    filename: String,
    name: String,
    size: Number,
    version: String,
    defaultID: String,
    uniqueID: String,
    order: Number
});

module.exports = mongoose.model('Dependency', Dependency);