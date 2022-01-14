var ConnectionTypes = require('./../constants/ConnectionTypes');
var structTypes = require('./../constants/ConnectionStructTypes').types;
var WorkerWrapper = require("../workers/WorkerWrapper");
var BackendWorker = require("../workers/BackendScriptWorkerWrapper");
var ActionTypes = require('../actions/ActionTypes');
var DataHandlerFactory = require('./DataHandling/DataHandlerFactory');
var DataFlowDiagram = require('./DataFlowDiagram');
var vizParams = require('../constants/CardsSchema');
var dataSourceMapper = require('./DataSourceMapper');

class WorkerSupervisor {

    constructor() {
        this.board = dataSourceMapper.dataFlowDiagram;
        this.connections = [];
        this.startWork = [];
        this.working = {};
        this.workingQueue = [];
        this.workers = {};
        this.maxWorkers = 2;
        this.loadedIDs = {};
        this.currentDataSets = {};
        this.currentSchemas = {};
    }

    init() {
        this.board = dataSourceMapper.dataFlowDiagram;
        this.connections = [];
        this.startWork = [];
        this.working = {};
        this.workingQueue = [];
        this.workers = {};
        this.maxWorkers = 2;
        this.loadedIDs = {};
        this.currentDataSets = {};
        this.currentSchemas = {};
    }

    setDispatch(dispatch) {
        this.dispatch = dispatch;
    }

    setViewsPanel(viewsPanel) {
        this.viewsPanel = viewsPanel;
    }

    addCard(options) {
        this.board.addCard(options);
    }

    removeCard(id) {
        this.board.removeCard(id);
    }

    moveCard(id, posX, posY) {
        this.board.moveCard(id, posX, posY);
    }

    addConnection(start, end, type, color, startIndex, endIndex) {
        this.board.addConnection(start, end, type, color, startIndex, endIndex);
    }

    removeConnection(ids) {
        this.board.removeConnection(ids);
    }

    addPanel(id, layout, title) {
        this.board.addPanel(id, layout, title);
    }

    addGrammarPanel(panelObj) {
        this.board.addGrammarPanel(panelObj);
    }

    addVizToPanel(panelID, id) {
        this.board.addVizToPanel(panelID, id);
    }

    modOption(cardKey, optionID, option, optionIdentifier) {
        this.board.cards[cardKey].options[optionID] =
            Object.assign({}, this.board.cards[cardKey].options[optionID], option);
        if (this.board.cards[cardKey].category === "viz")
            this.finishedWork(cardKey, "options", this.board.cards[cardKey].options[optionID].id);
        else
            this.startWorking(cardKey);
    }

    removeAllPanels(){
        this.board.panels = {};
    }

    finishedWork(cardKey, prop, optionId) {
        delete this.working[cardKey];
        var self = this;

        this.invalidateData(cardKey);
        this.board.cards[cardKey].finishedWork = true;
        this.board.cards[cardKey].getAllChildren().forEach(function (connection) {
            var cardKey = connection.end;
            var props;
            if (prop) {
                props = vizParams.cards[self.board.cards[cardKey].type].inConnections.map(function (conn) {
                    return ConnectionTypes.property[conn.type];
                }).filter(function (propFromConnection) {
                    return propFromConnection === prop;
                })
            }
            if ((props && props.length > 0) || !props) {
                var sharesOptionId = false;
                if (optionId)
                    sharesOptionId = self.board.cards[cardKey].options.filter(function (option) {
                        return option.id === optionId;
                    }).length > 0;

                if ((optionId && sharesOptionId) || !optionId)
                    if (self.board.cards[cardKey].category === "viz")
                        self.notifyUpdate(cardKey);
                    else
                        self.startWorking(cardKey);
            }

        });

        if (prop === ConnectionTypes.property[ConnectionTypes.OPTION_CONNECTION])
            this.notifyUpdate(cardKey);

        if (Object.keys(this.working).length === 0) this.dispatch({type: ActionTypes.HIDE_WORKING_MESSAGE});
        if (this.workingQueue.length > 0) this.startWorking(this.workingQueue[0])
    }

    notifyUpdate(cardKey) {
        this.viewsPanel.updateVisualization(cardKey);
    }

    setCardProp(cardKey, prop, value) {
        this.board.cards[cardKey][prop] = value;
        if (Object.values(ConnectionTypes.property).indexOf(prop) !== -1 && this.board.cards[cardKey].type !== "data_input")
            this.finishedWork(cardKey, prop);
    }

    checkPropertyStructure(value, property) {
        var correctStructure = true;
        try {
            if (ConnectionTypes.typeFromProperty[property])
                ConnectionTypes.propertyStructure[ConnectionTypes.typeFromProperty[property]].forEach(function (structure) {
                    var property = value;

                    structure.path.forEach(function (path) {
                        property = property[path];
                    });

                    switch (structure.type) {
                        case structTypes.OBJECT:
                            correctStructure = correctStructure && typeof property === 'object' && property !== null;
                            break;
                        case structTypes.ARRAY:
                            correctStructure = correctStructure && Array.isArray(property);
                            break;
                        case structTypes.STRING:
                            correctStructure = correctStructure && (typeof property === 'string' || property instanceof String);
                            break;
                        case structTypes.NUMERIC:
                            correctStructure = correctStructure && typeof property === 'number';
                            break;
                        case structTypes.BOOL:
                            correctStructure = correctStructure && typeof property === 'boolean';
                            break;
                    }
                });
        }
        catch (e) {
            correctStructure = false;
        }

        return correctStructure;
    }

    setCardPropFromVizPanel(panelID, cardKey, prop, value) {
        if (this.checkPropertyStructure(value, prop)) {
            this.board.cards[cardKey][prop] = value;
            this.board.panels[panelID].lastUpdateFrom = cardKey;
            this.board.panels[panelID].gotUpdate = [];
            if (Object.values(ConnectionTypes.property).indexOf(prop) !== -1)
                this.finishedWork(cardKey, prop);
        }
        else {
            this.dispatch({
                type: ActionTypes.SHOW_ERROR_MESSAGE,
                message: 'Property "' + prop + '" has incorrect value.'
            });
        }
    }

    getLastUpdateFrom(vizIndex, panelID) {
        if (this.board.panels[panelID].gotUpdate && this.board.panels[panelID].gotUpdate.indexOf(vizIndex) === -1) {
            this.board.panels[panelID].gotUpdate.push(vizIndex);
            return this.board.panels[panelID].lastUpdateFrom;
        }
        else {
            return undefined;
        }
    }

    invalidateData(dataSourceID) {
        var self = this;
        Object.keys(this.loadedIDs).forEach(function (loadedID) {
            if (loadedID.indexOf("id" + dataSourceID + ".") > -1)
                delete self.loadedIDs[loadedID]
        });
        Object.keys(this.currentDataSets).forEach(function (currentDataSets) {
            if (currentDataSets.indexOf("id" + dataSourceID + ".") > -1)
                delete self.currentDataSets[currentDataSets]
        });
    }

    loadData(cardKey) {
        var self = this;
        var operationList = this.getDataOperationList(cardKey);
        if (operationList.operations.length > 0) {
            var branchID = operationList.branchId;
            if (Object.keys(this.loadedIDs).indexOf(branchID + "") === -1) {
                self.loadedIDs[branchID] = this.getDataTable(cardKey, operationList).then(function (dataTable) {
                    self.currentDataSets[branchID] = dataTable;
                    return Promise.resolve();
                });
            }
            return this.loadedIDs[branchID];
        }
        return Promise.resolve();
    }

    isDataLoaded(cardKey) {
        var operationList = this.getDataOperationList(cardKey);
        if (operationList.operations.length > 0) {
            var branchID = operationList.branchId;
            return Object.keys(this.currentDataSets).indexOf(branchID) !== -1;
        }
        return true;
    }

    getData(cardKey) {
        return this.currentDataSets[this.getDataOperationList(cardKey).branchId].getAllData();
    }

    getHandler(cardKey) {
        return this.currentDataSets[this.getDataOperationList(cardKey).branchId];
    }

    getSchema(cardKey) {
        return this.currentDataSets[this.getDataOperationList(cardKey).branchId].getAllSchema();
    }

    getDataOperationList(cardKey) {
        var self = this;
        var parentHeap = this.getAllDataParents(cardKey);
        var childrenCollector = {};
        var operationList = [];
        var changeSources = [];
        var dataSources = [];
        var initalInput = this.getAllDataParentsWithIndex(cardKey);
        //TODO: find a more precise branchid
        var branchId = "";
        while (parentHeap.length > 0) {
            var currentElemId = parentHeap.shift();
            var parents = this.getAllDataParents(currentElemId);
            parentHeap = parents.concat(parentHeap);

            changeSources.push("DataSource" + currentElemId);
            if (this.board.cards[currentElemId].type === "data_input") {
                operationList.unshift({
                    id: currentElemId, type: "input", input: [],
                    fileName: this.board.cards[currentElemId].options[0].loadedFileName, remove: []
                });
                dataSources.push("DataSource" + currentElemId)
            }
            else {
                operationList.unshift({id: currentElemId, type: "proccesing", input: parents, remove: []});

            }

        }

        operationList.forEach(function (struct) {
            branchId += "id" + struct.id + ".";
            var parents = self.getAllDataParents(struct.id);
            parents.forEach(function (parentID) {
                childrenCollector[parentID] = (childrenCollector[parentID] || []).concat([struct.id]);
                var parentChildren = self.getAllDataChildren(parentID);
                var allChildren = true;
                parentChildren.forEach(function (childrenID) {
                    if (childrenCollector[parentID].indexOf(childrenID) === -1)
                        allChildren = false;
                });

                if (allChildren)
                    struct.remove = (struct.remove || []).concat([parentID]);
            });
        });

        branchId += initalInput.map(function (input) {
            return input.start + "-" + input.startIndex;
        }).join('.');

        return {
            dataSources: dataSources,
            changeSources: changeSources,
            operations: operationList,
            input: initalInput,
            branchId: branchId
        };
    }

    getAllDataParents(cardKey) {
        var parentHeap = [];
        this.board.cards[cardKey].getAllParents().forEach(function (connection) {
            if (connection.type === ConnectionTypes.DATA_CONNECTION)
                parentHeap.unshift(connection.start);
        });
        return parentHeap;
    }

    getAllDataParentsWithIndex(cardKey) {
        var parentHeap = [];
        this.board.cards[cardKey].getAllParents().forEach(function (connection) {
            if (connection.type === ConnectionTypes.DATA_CONNECTION)
                parentHeap.unshift({
                    start: connection.start,
                    startIndex: connection.startIndex,
                    endIndex: connection.endIndex
                });
        });
        return parentHeap;
    }

    getAllDataChildren(cardKey) {
        var parentHeap = [];
        this.board.cards[cardKey].getAllChildren().forEach(function (connection) {
            if (connection.type === ConnectionTypes.DATA_CONNECTION)
                parentHeap.unshift(connection.end);
        });
        return parentHeap;
    }

    getDataTable(cardKey, operationList) {
        var dataHandler = new DataHandlerFactory("database", cardKey, operationList);
        return dataHandler.getDataHandler();
    }

    modLayout(panelId, layout) {
        this.board.modLayout(panelId, layout);
    }

    startWorking(cardKey, alternativeOptions) {

        if (this.board.cards[cardKey].category !== "viz") {
            var self = this;
            var canStart = true;
            this.board.cards[cardKey].getAllParents().forEach(function (connection) {
                canStart = canStart && (self.board.cards[connection.start].finishedWork || self.board.cards[connection.start].category === 'viz');
            });

            var visitedDescendants = [];
            var allDescendants = this.board.cards[cardKey].getAllChildren().map(function (connection) {
                return connection.end;
            });

            while (allDescendants.length > 0) {
                var descendant = allDescendants.pop();
                visitedDescendants.push(descendant);
                var children = this.board.cards[descendant].getAllChildren().map(function (connection) {
                    return connection.end;
                });
                children.forEach(function (childID) {
                    if (allDescendants.indexOf(childID) === -1 && visitedDescendants.indexOf(childID) === -1) {
                        allDescendants.push(childID);
                    }
                })
            }

            visitedDescendants.forEach(function (id) {
                if (self.workers[id]) {
                    self.workers[id].terminate();
                    self.dispatch({type: ActionTypes.WORK_CANCELED, id: id});
                    delete self.workers[id];
                }
                self.workingQueue = self.workingQueue.filter(function (elem) {
                    return elem !== id
                });
                delete self.working[id];
            });

            if (canStart && !this.working[cardKey] && Object.keys(this.working).length < this.maxWorkers) {

                this.working[cardKey] = true;
                this.workingQueue = this.workingQueue.filter(function (elem) {
                    return elem !== cardKey
                });

                var input = {};
                var numOptionsId = 0;
                var optionsWithId = {};
                var state = self.board.cards[cardKey];
                var stateOptions = alternativeOptions !== undefined ? [alternativeOptions] : state.options;
                stateOptions.forEach(function (option, index) {
                    if (option.id) {
                        optionsWithId[option.id] = index;
                        numOptionsId++;
                    }
                });

                this.board.cards[cardKey].getAllParents().forEach(function (connection) {
                    if (connection.type !== ConnectionTypes.DATA_CONNECTION) {
                        if (input[ConnectionTypes.property[connection.type]] === undefined)
                            input[ConnectionTypes.property[connection.type]] = [];

                        var isUniqueConnection = _.filter(vizParams.cards[self.board.cards[cardKey].type].inConnections, {type: connection.type})[0].unique;
                        if (isUniqueConnection)
                            input[ConnectionTypes.property[connection.type]] = self.board.cards[connection.start][ConnectionTypes.property[connection.type]];
                        else
                            input[ConnectionTypes.property[connection.type]].push(self.board.cards[connection.start][ConnectionTypes.property[connection.type]]);

                        if (connection.type === ConnectionTypes.OPTION_CONNECTION && numOptionsId > 0) {
                            self.board.cards[connection.start][ConnectionTypes.property[connection.type]].forEach(function (option) {
                                if (optionsWithId[option.id] !== undefined) {
                                    //TODO: it could be overwriting values
                                    stateOptions[optionsWithId[option.id]] = option;
                                }
                            });
                        }
                    }
                });

                state.options = stateOptions;


                var operationList = this.getDataOperationList(cardKey);
                var worker;
                var cardType = self.board.cards[cardKey].type;
                var cardSchema = vizParams.cards[self.board.cards[cardKey].type];
                if (cardSchema.runOn === "r" || cardSchema.runOn === "python")
                    worker = new BackendWorker(input, self.board.cards[cardKey], this.dispatch, cardKey, operationList, cardSchema.runOn);
                else
                    worker = new WorkerWrapper(input, state, this.dispatch, cardKey, operationList,
                        cardSchema.workerPath, cardType);


                var webWorker = worker.start();
                this.workers[cardKey] = webWorker;
                this.dispatch({type: ActionTypes.START_WORK, id: cardKey});
                if (Object.keys(this.working).length > 0) this.dispatch({
                    type: ActionTypes.SHOW_WORKING_MESSAGE,
                    currentlyWorkingIds: Object.keys(this.working)
                });
            }
            else if (canStart && this.workingQueue.indexOf(cardKey) === -1 && Object.keys(this.working).length >= this.maxWorkers) {
                this.workingQueue.push(cardKey);
            }
        }
    }

}

module.exports = new WorkerSupervisor();