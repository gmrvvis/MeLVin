'use strict';

var ConnectionTypes = require('./../constants/ConnectionTypes');
var ConnectionHub = require('./ConnectionHub');

class Card {

    //TODO: change default props to different prefix
    constructor(options) {
        var self = this;
        this.id = options.id;
        this.posX = options.posX;
        this.posY = options.posY;
        this.title = options.title;
        this.type = options.type;
        this.category = options.category;
        this.schema = options.schema || [];
        this.filters = options.filters || [];
        this.children = new ConnectionHub(options.children);
        this.parents = new ConnectionHub(options.parents);
        this.dataSource = options.dataSource || [];
        this.options = options.options || [];
        this.isConfigured = options.isConfigured || false;
        this.options = options.options;
        this.shareSelectedData = options.shareSelectedData;
        this.shareSelection = options.shareSelection;
        this.selectionSource = options.selectionSource;
        this.finishedWork = options.finishedWork || false;
        this.colorGroups = options.colorGroups || {groups: {}, lastGroupID: 0};
        this.workingOps = options.workingOps || 0;
        this.dataSource = options.dataSource;
        this.selection = options.selection || [];
        this.progress = options.progress || 0;
        this.processing = options.processing || false;
        this.workerPath = options.workerPath || "";
        if (this.category === "component") {
            this.layout = options.layout || [];
            this.shareSelectedData = false;
            this.shareSelection = false;
            this.selectionSource = -1;
            this.lastSelectionFrom = -1 || options.lastSelectionFrom;
        }

        if(this.category !== "viz"){
            this.dataSource = [this.id];
        }

        if (this.type === "data_input") {

            this.selection = options.selection || {file: "none", schema: "none"};
        }

        if (this.category === "filter" || this.category === "viz" || this.category === "component")
            this.isConfigured = true;

        //TODO: remove when previous task is completed
        ConnectionTypes.types.forEach(function (type) {
            var property = ConnectionTypes.property[type];
            if(options[property]) self[property] = options[property]
        })
    }

    addChild(connection) {
        this.children.addConnection(connection, connection.end);
        this.children = new ConnectionHub(this.children);
    }

    addParent(connection) {
        this.parents.addConnection(connection, connection.start);
        this.parents = new ConnectionHub(this.parents);
    }

    removeChild(connection) {
        this.children.removeConnection(connection, connection.end);
        this.children = new ConnectionHub(this.children);
    }

    removeParent(connection) {
        this.parents.removeConnection(connection, connection.start);
        this.parents = new ConnectionHub(this.parents);
    }

    getAllChildren() {
        return this.children.getAllConnections();
    }

    getChildren(connectionType) {
        return this.children.getConnections(connectionType);
    }

    getAllParents() {
        return this.parents.getAllConnections();
    }

    getParents(connectionType) {
        return this.parents.getConnections(connectionType);
    }

}

module.exports = Card;