var io = require('socket.io-client');
var LibLoader = require('./LibLoader');
var CardLoader = require('./CardLoader');
var ActionTypes = require('../actions/ActionTypes');
var vizParams = require('../constants/CardsSchema');
window.vizParams = vizParams;
var Dexie = require('dexie');
var workerSupervisor = require('./WorkerSupervisor');
var ConnectionTypes = require('./../constants/ConnectionTypes');
var dataSourceMapper = require('./DataSourceMapper');

class Socket {

    getType(column, name) {
        var isCategorical = typeof column[0] === "string";

        var attr = {name: name};
        if (isCategorical) {
            var uniqueValues = [];
            column.forEach(function (data, i) {
                if (uniqueValues.indexOf(data) === -1)
                    uniqueValues.push(data);
            });

            attr.attribute_type = "CATEGORICAL";
            attr.uniqueValues = uniqueValues;
        }
        else {
            var min = column[0];
            var max = column[0];
            column.forEach(function (data, i) {
                if (min > column[i]) min = column[i];
                if (max < column[i]) max = column[i];
            });
            attr.attribute_type = "QUANTITATIVE";
            attr.max = min;
            attr.min = max;
        }

        return attr;
    }

    init(dispatch) {
        var self = this;
        this.dispatch = dispatch;
        this.socket = io(window.location.hostname, {
            path: '/auth/wSocket',
            transports: ['websocket']
        });

        this.socket.on('connect',
            function () {
                console.log("Connected to server.");
            }
        );

        this.socket.on('Account.username', function (username) {
            self.dispatch({type: ActionTypes.UPDATE_USERNAME, username: username})
        });

        this.socket.on('RScriptResult', function (data) {

            data = JSON.parse(data);
            var result = JSON.parse(data.result);

            var dataParent = Object.keys(workerSupervisor.board.cards[data.id].getParents("DATA_CONNECTION"))[0];
            var schema = Object.assign(workerSupervisor.board.cards[dataParent].schema);
            for (var i = 0; i < result.length; i++) {
                schema.attributes[result[i].attr.name] = result[i].attr;
            }

            var db = new Dexie("database");
            db.version(1).stores({
                schemas: "name,schema",
                changes: "name,change",
                datasets: "name,dataset"
            });
            db.open();

            db.transaction('rw', db.changes, function* () {
                db.changes.put({name: "DataSource" + data.id, change: result});
            }).catch(function (err) {
                console.error(err.stack || err);
            });
            self.dispatch({type: ActionTypes.SET_CARD_PROP, value: schema, id: data.id, prop: "schema"});
            self.dispatch({type: ActionTypes.SET_CARD_PROP, value: 100, id: data.id, prop: "progress"});
            self.dispatch({type: ActionTypes.SET_CARD_PROP, value: false, id: data.id, prop: "processing"});
            self.dispatch({type: ActionTypes.FINISHED_WORK, id: data.id});
        });


        this.socket.on('Session.init', function (stateData) {
            self.dispatch({type: ActionTypes.SET_FULL_LOADING_MESSAGE, message: "Loading libraries"});
            LibLoader.loadInitialLibs(stateData.libFiles, function () {
                self.dispatch({type: ActionTypes.SET_FULL_LOADING_MESSAGE, message: "Loading custom cards"});

                self.dispatch({
                    type: ActionTypes.SET_FULL_LOADING_MESSAGE,
                    message: "Loading custom cards"
                });

                stateData.vizSchemas.forEach(function (vizSchema) {
                    vizSchema = JSON.parse(vizSchema.properties);
                    vizParams.names[vizSchema.className] = vizSchema.className;
                    vizParams.cards[vizSchema.className] = vizSchema;
                    if (vizSchema.menu) {

                    } else {
                        vizParams.cardMenu[0].cards.push(vizSchema.className);
                    }
                });

                stateData.connSchemas.forEach(function (connSchema) {
                    ConnectionTypes[connSchema.property] = connSchema.property;
                    ConnectionTypes.labels[connSchema.property] = connSchema.name + " connections";
                    ConnectionTypes.labels_short[connSchema.property] = connSchema.name;
                    ConnectionTypes.types.push(connSchema.property);
                    ConnectionTypes.property[connSchema.property] = connSchema.property;
                    ConnectionTypes.icons[connSchema.property] = connSchema.iconUnicode;
                    ConnectionTypes.iconsText[connSchema.property] = connSchema.icon;
                    ConnectionTypes.typeFromProperty[connSchema.property] = connSchema.property;
                    ConnectionTypes.propertyStructure[connSchema.property] = connSchema.translatedStructure;

                });

                CardLoader.loadList(stateData.vizFiles, function () {
                    self.dispatch({
                        type: ActionTypes.HIDE_FULL_LOADING
                    });
                    self.dispatch({
                        type: ActionTypes.SESSION_INIT, workspace: stateData
                    });
                });
            });
        });

        this.socket.on('Visualization.refresh', function (importDescription, message) {
            self.showGlobalMessage(message);
            var pathsToLoad = importDescription.cards.map(function (cardDesc) {
                return cardDesc.path;
            });

            importDescription.cards.forEach(function (cardDesc) {
                var schema = cardDesc.schema;
                vizParams.names[schema.className] = schema.className;
                vizParams.cards[schema.className] = schema;
                if (schema.menu) {

                } else {
                    vizParams.cardMenu[0].cards.push(schema.className);
                }

                return cardDesc.schema;
            });

            CardLoader.loadList(pathsToLoad, function () {
                self.dispatch({type: ActionTypes.UPDATE_VIZ_LIST});
            });

            LibLoader.loadLibraries(importDescription.dependencies, function () {
            });

        });

        this.socket.on('Card.refresh', function (importDescription, message) {
            self.showGlobalMessage(message);
            importDescription.cards.forEach(function (cardDesc) {
                var schema = cardDesc.schema;
                vizParams.names[schema.className] = schema.className;
                vizParams.cards[schema.className] = schema;
                if (schema.menu) {

                } else {
                    vizParams.cardMenu[0].cards.push(schema.className);
                }

                return cardDesc.schema;
            });

            self.dispatch({type: ActionTypes.UPDATE_VIZ_LIST});

        });

        this.socket.on('Connection.refresh', function (connections, message) {
            self.showGlobalMessage(message);
            connections.forEach(function (connSchema) {
                ConnectionTypes[connSchema.property] = connSchema.property;
                ConnectionTypes.labels[connSchema.property] = connSchema.name + " connections";
                ConnectionTypes.labels_short[connSchema.property] = connSchema.name;
                if(ConnectionTypes.types.indexOf(connSchema.property) === -1)
                    ConnectionTypes.types.push(connSchema.property);
                ConnectionTypes.property[connSchema.property] = connSchema.property;
                ConnectionTypes.icons[connSchema.property] = connSchema.iconUnicode;
                ConnectionTypes.iconsText[connSchema.property] = connSchema.icon;
                ConnectionTypes.typeFromProperty[connSchema.property] = connSchema.property;
                ConnectionTypes.propertyStructure[connSchema.property] = connSchema.translatedStructure;
            });

            // self.dispatch({type: ActionTypes.UPDATE_VIZ_LIST});
        });

        this.socket.on('Visualization.remove', function (removedIds) {
            removedIds.forEach(function (id) {
                delete vizParams.names[id];
                delete vizParams.cards[id];
                vizParams.cardMenu[0].cards = vizParams.cardMenu[0].cards.filter(function (className) {
                    return className !== id;
                });
            });

            self.dispatch({type: ActionTypes.UPDATE_VIZ_LIST});
        });

        this.socket.on('Connection.remove', function (removedProps) {
            removedProps.forEach(function (property) {
                delete ConnectionTypes[property];
                delete ConnectionTypes.labels[property];
                delete ConnectionTypes.labels_short[property];
                var index = ConnectionTypes.types.indexOf(property);
                if (index !== -1) ConnectionTypes.types.splice(index, 1);
                delete ConnectionTypes.property[property];
                delete  ConnectionTypes.icons[property];
                delete ConnectionTypes.iconsText[property];
            });
        });

        this.socket.on('Connection.download', function (downloadObj) {
            if (downloadObj.type === 'JSON') {
                self.downloadJSON(downloadObj.content);
            }
            else {
                self.downloadFile(downloadObj.content);
            }
        });


        this.socket.on('Session.reloadSessionList', function (stateData) {
            self.dispatch({type: ActionTypes.SESSION_LIST_RELOAD, workspace: stateData});
        });

        this.socket.on('Workspace.load', function (stateData) {
            self.dispatch({type: ActionTypes.UPDATE_STATE, workspace: stateData});
            dataSourceMapper.importDFD(stateData.session);
            self.dispatch({type: ActionTypes.RESET_UI, id: stateData.id});
        });


        this.socket.on('Dependency.list', function (libFiles) {
            self.dispatch({type: ActionTypes.UPDATE_LIB_LIST, files: libFiles});
            LibLoader.loadLibraries(libFiles, function () {
            });
        });

        this.socket.on('Connection.list', function (libFiles) {
            //TODO: update connection list
        });


        this.socket.on('File.list', function (files, message) {
            self.showGlobalMessage(message);
            self.dispatch({type: ActionTypes.UPDATE_FILE_LIST, files: files});
        });

        this.socket.on('Thumbnail.list', function (previewFiles, message) {
            self.showGlobalMessage(message);
            self.dispatch({type: ActionTypes.UPDATE_PREVIEW_LIST, files: previewFiles});
        });

        this.socket.on('Visualization.download', function (path) {
            self.downloadFile(path);
        });

        this.socket.on('Card.download', function (path) {
            self.downloadFile(path);
        });

        this.socket.on('Session.download', function (path) {
            self.downloadFile(path);
        })
    }

    downloadFile(downalodURI) {
        var downloadA = $("#downloader")[0];
        downloadA.setAttribute("href", downalodURI);
        downloadA.setAttribute("download", downalodURI.split("/").pop());
        downloadA.click();
        downloadA.setAttribute("href", "");
        downloadA.setAttribute("download", "");
    }

    downloadJSON(json_content) {
        var downloadA = $("#downloader")[0];
        var JSONBlob = new Blob([JSON.stringify(json_content)], {type: "application/json"});
        downloadA.setAttribute("href", URL.createObjectURL(JSONBlob));
        downloadA.setAttribute("download", "connection.json");
        downloadA.click();
        downloadA.setAttribute("href", "");
        downloadA.setAttribute("download", "");
    }

    showGlobalMessage(message) {
        this.dispatch({
            type: ActionTypes.SHOW_MESSAGE,
            message: message
        });
    }

    saveSession(session, id) {
        this.socket.emit('Session.save', {session: JSON.stringify(session), id: id});
    }

    initSession() {
        this.socket.emit('Session.init');
    }

    addSession(title, description, id) {
        this.socket.emit('Session.add', {title: title, description: description, id: id});
    }

    removeSession(id) {
        this.socket.emit('Session.remove', id);
    }

    loadSession(id) {
        this.socket.emit('Session.load', id);
    }

    downloadCards(ids) {
        this.socket.emit('Card.download', ids);
    }

    downloadVisulizations(ids) {
        this.socket.emit('Visualization.download', ids);
    }


    removeViz(ids) {
        this.socket.emit("Visualization.remove", ids);
    }

    removeCard(ids) {
        this.socket.emit("Card.remove", ids);
    }

    removeCustomConn(properties) {
        this.socket.emit("Connection.remove", properties);
    }

    listFiles() {
        this.socket.emit('File.list');
    }

    renameFile(oldFileName, newFileName) {
        this.socket.emit('File.rename', oldFileName, newFileName);
    }

    renameThumbnail(oldFileName, newFileName) {
        this.socket.emit('Thumbnail.rename', oldFileName, newFileName);
    }

    removeFiles(fileNames) {
        this.socket.emit("File.remove", fileNames);
    }

    removeThumbnails(fileNames) {
        this.socket.emit("Thumbnail.remove", fileNames);
    }

    removeDependencies(fileNames) {
        this.socket.emit("Dependency.remove", fileNames);
    }

    runRScript(script, filename) {
        this.socket.emit("Rscript.run", {script: script, file: file});
    }

    runPyScript(script, filename) {
        this.socket.emit("PyScript.run", {script: script, file: file});
    }

    uploadCard(schema) {
        this.socket.emit('Card.load', schema);
    }

    uploadViz(schema) {
        this.socket.emit('Visualization.load', schema);
    }

    uploadConn(schema) {
        this.socket.emit('Connection.load', schema);
    }

    startRScript() {
        this.socket.emit('RScript.run.start');
    }

    updateLibParams(fileName, properties) {
        this.socket.emit('Dependency.params', fileName, properties);
    }

    downloadSession(id) {
        this.socket.emit('Session.download', id);
    }

    downloadConnection(id) {
        this.socket.emit('Connection.download', id);
    }

}

let SocketSingleton = new Socket();
module.exports = SocketSingleton;

