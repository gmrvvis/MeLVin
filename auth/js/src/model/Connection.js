'use strict';

var Connection = function (config) {
    this.id = config.id || (config.start + "" + config.end + "" + config.type);
    this.start = config.start;
    this.end = config.end;
    this.type = config.type;
    this.color = config.color || "";
    this.startIndex = config.startIndex || 0;
    this.endIndex = config.endIndex || 0;
};

Connection.prototype = {
    constructor: Connection,
};

module.exports = Connection;