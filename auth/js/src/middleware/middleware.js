'use strict';

var actionTypes = require('../actions/ActionTypes');
var CardBuilderActions = require('../actions/CardBuilderActionTypes');
var workerSupervisor = require('../model/WorkerSupervisor');
var dataSourceMapper = require('../model/DataSourceMapper');
var unwantedPropsInSession = {
    ui: ["username", "cardBeingDragged", "files", "libFiles", "previewFiles", "socket", "currentSessionID", "sessions",
        "cardsSchema", "customVizNames"]
};
var unwantedSectionsInSession = ["visualizationCreatorSchema", "cardCreatorSchema"];
var socket = require('../model/Socket');

function middleware(store) {
    var getState = store.getState;

    return function (next) {
        return function (action) {

            switch (action.type) {

                case actionTypes.OPEN_CONNECTION:
                    socket.init(store.dispatch);
                    return next(action);

                case actionTypes.UPDATE_STATE:
                    dataSourceMapper.resetDFD();
                    workerSupervisor.init();
                    return next(action);

                case actionTypes.SAVE_SESSION:
                    var id = getState().ui.currentSessionID;
                    socket.saveSession(dataSourceMapper.exportDFD(), id);
                    return next(action);

                case actionTypes.SESSION_LOAD:
                    socket.loadSession(action.id);
                    return next(action);

                case actionTypes.LOAD_SESSION:
                    socket.initSession();
                    return next(action);

                case actionTypes.SESSION_ADD:
                    socket.addSession(action.title, action.description, action.id);
                    return next(action);

                case actionTypes.SESSION_REMOVE:
                    socket.removeSession(action.id);
                    return next(action);

                case actionTypes.CARDS_DOWNLOAD_ALL:
                    socket.downloadCards([]);
                    return next(action);

                case actionTypes.CARDS_DOWNLOAD_ONE:
                    socket.downloadCards([action.ids]);
                    return next(action);

                case actionTypes.VIZ_DOWNLOAD_ALL:
                    socket.downloadVisulizations([]);
                    return next(action);

                case actionTypes.VIZ_DOWNLOAD_ONE:
                    socket.downloadVisulizations(action.ids);
                    return next(action);

                case actionTypes.REMOVE_VIZ:
                    socket.removeViz(action.ids);
                    return next(action);

                case actionTypes.REMOVE_PROC_CARD:
                    socket.removeCard(action.ids);
                    return next(action);

                case actionTypes.REMOVE_CUSTOM_CONN:
                    socket.removeCustomConn(action.properties);
                    return next(action);

                case actionTypes.DOWNLOAD_FILE:
                    socket.downloadFile(action.path);
                    return next(action);

                case actionTypes.LIST_FILES:
                    socket.listFiles();
                    return next(action);

                case actionTypes.RENAME_FILE:
                    socket.renameFile(action.oldFileName, action.newFileName);
                    return next(action);

                case actionTypes.REMOVE_FILE:
                    socket.removeFiles([action.name]);
                    return next(action);

                case actionTypes.REMOVE_ALL_FILES:
                    socket.removeFiles([]);
                    return next(action);

                case actionTypes.REMOVE_DEPENDENCY:
                    socket.removeDependencies([action.name]);
                    return next(action);

                case actionTypes.REMOVE_ALL_DEPENDENCIES:
                    socket.removeDependencies([]);
                    return next(action);


                case actionTypes.REMOVE_PREVIEW:
                    socket.removeThumbnails([action.name]);
                    return next(action);

                case actionTypes.REMOVE_ALL_PREVIEWS:
                    socket.removeThumbnails([]);
                    return next(action);

                case actionTypes.RENAME_PREVIEW:
                    socket.renameThumbnail(action.oldFileName, action.newFileName);
                    return next(action);

                case actionTypes.RUN_PYSCRIPT:
                    socket.runPyScript(action.script, action.file);
                    return next(action);

                case actionTypes.RUN_RSCRIPT:
                    socket.runRScript(action.script, action.file);
                    return next(action);


                case CardBuilderActions.SEND_CUSTOM_VIZ:
                    var vizCreator = Object.assign({}, getState().cardCreatorSchema);
                    vizCreator.canBeLoaded = false;

                    var newSchema = Object.assign({}, vizCreator.schema);
                    newSchema.thumbnail = "./auth/previews/" + newSchema.selectedPreview;
                    newSchema.preview = newSchema.selectedPreview;
                    newSchema.id = newSchema.className;
                    newSchema.loadPreview = action.loadPreview;
                    newSchema.hasOptions = newSchema.options.length > 0;
                    //TODO: move computation
                    var availableConnections = {};
                    newSchema.outConnections = newSchema.outConnections.map(function (connection) {
                        if (availableConnections[connection.type] === undefined) availableConnections[connection.type] =
                            0;
                        else availableConnections[connection.type] = availableConnections[connection.type] + 1;
                        connection.index = availableConnections[connection.type];
                        return connection;
                    });

                    availableConnections = {};
                    newSchema.inConnections = newSchema.inConnections.map(function (connection) {
                        if (availableConnections[connection.type] === undefined) availableConnections[connection.type] =
                            0;
                        else availableConnections[connection.type] = availableConnections[connection.type] + 1;
                        connection.index = availableConnections[connection.type];
                        return connection;
                    });


                    socket.uploadCard(JSON.stringify(newSchema));
                    return next(action);

                case actionTypes.SEND_CUSTOM_VIZ:

                    var vizCreator = Object.assign({}, getState().visualizationCreatorSchema);
                    vizCreator.canBeLoaded = false;

                    var newSchema = Object.assign({}, vizCreator.schema);
                    newSchema.methods = Object.assign({}, vizCreator.schema.methods);
                    Object.keys(newSchema.methods).forEach(function (methodName) {
                        newSchema.methods[methodName] = Object.assign({}, newSchema.methods[methodName]);
                    });
                    newSchema.thumbnail = "./auth/previews/" + newSchema.selectedPreview;
                    newSchema.preview = newSchema.selectedPreview;
                    newSchema.id = newSchema.className;
                    newSchema.loadPreview = action.loadPreview;
                    newSchema.hasOptions = newSchema.options.length > 0;

                    var availableConnections = {};
                    newSchema.outConnections = newSchema.outConnections.map(function (connection) {
                        if (availableConnections[connection.type] === undefined) availableConnections[connection.type] =
                            0;
                        else availableConnections[connection.type] = availableConnections[connection.type] + 1;
                        connection.index = availableConnections[connection.type];
                        return connection;
                    });

                    availableConnections = {};
                    newSchema.inConnections = newSchema.inConnections.map(function (connection) {
                        if (availableConnections[connection.type] === undefined) availableConnections[connection.type] =
                            0;
                        else availableConnections[connection.type] = availableConnections[connection.type] + 1;
                        connection.index = availableConnections[connection.type];
                        return connection;
                    });


                    socket.uploadViz(JSON.stringify(newSchema));

                    return next(action);

                case actionTypes.SEND_CUSTOM_CONN:

                    var connectionSchema = Object.assign({}, getState().connectionCreatorSchema);
                    socket.uploadConn(JSON.stringify(connectionSchema));

                    return next(action);

                case actionTypes.SESSION_DOWNLOAD:
                    socket.downloadSession(action.id);
                    return next(action);

                case actionTypes.START_R_SCRIPT:
                    socket.startRScript(action.id, action.boardData, action.data);
                    return next(action);

                case actionTypes.EDIT_FILE_OPTION:
                    socket.updateLibParams(action.fileName, action.properties);
                    return next(action);

                case actionTypes.FINISHED_WORK:
                    workerSupervisor.finishedWork(action.id);
                    return next(action);

                case actionTypes.SET_CARD_PROP:
                    workerSupervisor.setCardProp(action.id, action.prop, action.value);
                    return next(action);

                case actionTypes.SET_CARD_PROP_VIZPANEL:
                    workerSupervisor.setCardPropFromVizPanel(action.panelID, action.id, action.prop, action.value);
                    return next(action);

                case actionTypes.SET_CARD_OPTIONS:
                    workerSupervisor.setCardProp(action.id, "options", action.options, action.optionId);
                    return next(action);


                case actionTypes.MOD_OPTION:
                    workerSupervisor.modOption(action.cardID, action.id, action.option, action.optionId);
                    return next(action);

                case actionTypes.ADD_CARD:
                    workerSupervisor.addCard({
                        id: action.id,
                        title: action.cardData.title,
                        type: action.cardData.type,
                        category: action.cardData.category,
                        options: action.options,
                        posX: action.cardData.posX,
                        posY: action.cardData.posY
                    });
                    return next(action);

                case actionTypes.ADD_PANEL:
                    workerSupervisor.addPanel(action.id, action.layout, action.title);
                    return next(action);

                case actionTypes.REMOVE_ALL_PANELS:
                    workerSupervisor.removeAllPanels();
                    return next(action);

                case actionTypes.ADD_GRAMMAR_PANEL:
                    workerSupervisor.addGrammarPanel(action.panelObj);
                    return next(action);

                case actionTypes.ADD_VIZ_TO_PANEL:
                    workerSupervisor.addVizToPanel(action.panelID, action.id);
                    return next(action);

                case actionTypes.REMOVE_CARD:
                    workerSupervisor.removeCard(action.id);
                    return next(action);

                case actionTypes.MOVE_CARD:
                    workerSupervisor.moveCard(action.id, action.posX, action.posY);
                    return next(action);

                case actionTypes.ADD_CONNECTION:
                    workerSupervisor.addConnection(action.start, action.end, action.connType, action.color,
                        action.startIndex, action.endIndex);
                    return next(action);

                case actionTypes.REMOVE_CONNECTION:
                    workerSupervisor.removeConnection(action.ids);
                    return next(action);

                case actionTypes.MOD_LAYOUT:
                    workerSupervisor.modLayout(action.id, action.layout);
                    return next(action);

                case actionTypes.CONNECTION_DOWNLOAD:
                    socket.downloadConnection(action.ids);
                    return next(action);
            }
            return next(action);
        };
    };
}

module.exports = middleware;