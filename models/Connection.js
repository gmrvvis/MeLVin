var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Connection = new Schema({
    username: String,
    property: String,
    name: String,
    icon: String,
    iconUnicode: String,
    structure: Object,
    translatedStructure: Array
});


module.exports = mongoose.model('Connection', Connection);