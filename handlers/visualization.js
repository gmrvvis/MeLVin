let path = require('path');
let fs = require('fs');

module.exports = function (basedir, customVizManager, socket) {
    let username = socket.client.request.user.username;

    socket.on('Visualization.load', function (schema) {
        var parsedSchema = JSON.parse(schema);
        var extractionFolder = path.join(basedir, 'uploads', username, 'customCards', 'visualizations', 'schemas');
        var schemaFilename = parsedSchema.className + ".json";

        fs.writeFileSync(path.join(extractionFolder, schemaFilename), schema);

        customVizManager.generateCard(schemaFilename, parsedSchema, username,
            function (pathToLoad) {
                delete parsedSchema.code;
                socket.emit('Visualization.refresh', pathToLoad, parsedSchema);
            }
        );
    });
    socket.on('Visualization.remove', function (ids) {
        let removedIds = customVizManager.removeCards(username, ids);
        socket.emit('Visualization.remove', removedIds);
    });
    
    socket.on('Visualization.download', function (visualizationIds) {
        let fileName = visualizationIds.length === 1 ? visualizationIds[0]+".zip" : "vizBundle.zip";
        let downloadPath = './auth/visualizations/' + fileName;
        customVizManager.generateCardBundle(username, visualizationIds, fileName, function () {
            socket.emit('Visualization.download', downloadPath);
        });
    });
    
};