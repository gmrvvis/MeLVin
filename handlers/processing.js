let path = require('path');
let fs = require('fs');

module.exports = function (basedir, customCardManager, socket) {
    let username = socket.client.request.user.username;

    socket.on('Card.load', function (schema) {
        console.log(schema);
        var parsedSchema = JSON.parse(schema);
        var extractionFolder = path.join(basedir, 'uploads', username, 'customCards', 'functional', 'schemas');
        var schemaFilename = parsedSchema.className + ".json";

        fs.writeFileSync(path.join(extractionFolder, schemaFilename), schema);

        customCardManager.generateCard(schemaFilename, parsedSchema, username,
            function (pathToLoad) {
                delete parsedSchema.method;
                socket.emit('Card.refresh', pathToLoad, parsedSchema);
            }
        );

    });

    socket.on('Card.remove', function (ids) {
        let removedIds = customCardManager.removeCards(username, ids);
        socket.emit('Visualization.remove', removedIds);
    });

    socket.on('Card.download', function (cardIds) {
        let fileName = cardIds.length === 1 ? cardIds[0]+".zip" : "procBundle.zip";
        let downloadPath = './auth/workers/' + fileName;
        customCardManager.generateCardBundle(username, cardIds, fileName, function () {
            socket.emit('Card.download', downloadPath);
        });
    });
    
};