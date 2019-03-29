let path = require('path');
let fs = require('fs');
let Connection = require('../models/Connection');

var getPathInStructure = (initialId, structure) => {
    let parent = structure[initialId].parentId;
    let path = [structure[initialId].title];
    while (parent >= 0) {
        path.unshift(structure[parent].title);
        parent = structure[parent].parentId;
    }
    path.shift(0);
    return path;
};

module.exports = function (basedir, connectionManager, socket) {
    let username = socket.client.request.user.username;

    socket.on('Connection.load', function (schema) {
        var parsedSchema = JSON.parse(schema);
        var translatedStructure = [];
        Object.values(parsedSchema.structure).map(function (element) {
            translatedStructure.push({path: getPathInStructure(element.id, parsedSchema.structure), type: element.type})
        });

        let update = {
            icon: parsedSchema.icon, name: parsedSchema.name, iconUnicode: parsedSchema.iconUnicode,
            structure: parsedSchema.structure, translatedStructure: translatedStructure
        };
        let options = {upsert: true, new: true, setDefaultsOnInsert: true};

        Connection.findOneAndUpdate({
            username: username,
            property: parsedSchema.property
        }, update, options, function (err, connection) {
            if (err) {
                console.error("Failed connection addition for user: " + username);
            }
            console.log("Successfully loaded connection for user: " + username)
        });
    });

    socket.on('Connection.remove', function (properties) {
        let correctlyRemovedIds = [];
        properties.forEach((property) => {
            Connection.findOneAndRemove({username: username, property: property}).exec((err, component) => {
                if (err || !component) console.log(err);
            });
            correctlyRemovedIds.push(property);
        });
        socket.emit('Connection.remove', correctlyRemovedIds);
    });


    socket.on('Connection.download', function (connectionIds) {
        let fileName = connectionIds.length === 1 ? connectionIds[0]+".zip" : "connectionBundle.zip";
        let downloadPath = '/auth/connections/' + fileName;
        connectionManager.generateConnBundle(username, connectionIds, downloadPath, fileName, function (downloadObj) {
            socket.emit('Connection.download', downloadObj);
        });
    });

};