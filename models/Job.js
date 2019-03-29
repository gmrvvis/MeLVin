var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Job = new Schema({
    id: String,
    username: String,
    operationList: String,
    state: String,
    input: String,
    changes: {type: Array, "default": []},
    resultPath: String,
    dataPath: String,
    codePath: String,
    schemaPath: String
});


module.exports = mongoose.model('Job', Job);