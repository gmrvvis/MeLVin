'use strict';

var ConnectionTypes = require('./../constants/ConnectionTypes');

class ConnectionHub {
    constructor(options) {
        var self = this;
        if (typeof options === "undefined" || typeof options.connections === "undefined") {
            this.connections = {length: 0};
            Object.keys(ConnectionTypes).forEach(function (connType) {
                if (ConnectionTypes.hasOwnProperty(connType)) {
                    self.connections[connType] = {};
                }
            });
        }
        else {
            this.connections = options.connections;
        }

    }

    addConnection(connection, id) {
        if (!this.connections[connection.type][id]) this.connections.length++;
        this.connections[connection.type][id] = connection;
    }

    removeConnection(connection, id) {
        delete this.connections[connection.type][id];
        this.connections.length--;
    }

    getAllConnections() {
        var self = this;
        var connections = [];
        Object.keys(ConnectionTypes).forEach(function (connType) {
            Object.keys(self.connections[connType]).forEach(function (connectionID) {
                connections.push(self.connections[connType][connectionID]);
            })
        });

        return connections;
    }

    getConnections(connectionType) {
        return this.connections[connectionType];
    }

}

module.exports = ConnectionHub;