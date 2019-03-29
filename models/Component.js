var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Component = new Schema({
    username: String,
    id: String,
    type: String,
    properties: String,
    schemaFileName: String,
    codeFileName: String,
    previewFileName: String,
    libs: Array
});


module.exports = mongoose.model('Component', Component);