'use strict';
var Card = require('./Card');
var Connection = require('./Connection');
var ConnectionTypes = require('./../constants/ConnectionTypes');

class DataFlowDiagram {
    constructor(config) {
        this.id = config.id;
        this.cards = Object.assign({}, config.cards) || {};
        this.connections = config.connections || {};
        this.panels = {};
        this.layers = {};
        this.layers = {};
    }

    addCard(options) {
        var card = new Card(options);
        this.cards[card.id] = card;
    }

    moveCard(cardID, posX, posY) {
        this.cards[cardID].posX = posX;
        this.cards[cardID].posY = posY;
    }

    modLayout(panelId, layout) {
        this.panels[panelId].layout = layout;
    }

    removeCard(id) {
        var card = this.cards[id];
        var self = this;
        var affectedChildren = [];

        Object.keys(ConnectionTypes).forEach(function (connType) {
            Object.keys(card.getChildren(connType)).forEach(function (childID) {
                delete self.connections[self.cards[childID].parents.connections.id];
                delete self.cards[childID].parents.connections[connType][card.id];
                self.cards[childID].parents.connections.length--;
            })
        });

        Object.keys(ConnectionTypes).forEach(function (connType) {
            Object.keys(card.getParents(connType)).forEach(function (parentID) {
                delete self.connections[self.cards[parentID].children.connections.id];
                delete self.cards[parentID].children.connections[connType][card.id];
                self.cards[parentID].children.connections.length--;
                affectedChildren.push(parentID);
            })
        });

        delete this.cards[id];

        return affectedChildren;
    }

    addConnection(start, end, type, color, startIndex, endIndex) {
        var connection = new Connection({
            start: start,
            end: end,
            type: type,
            color: color,
            startIndex: startIndex,
            endIndex: endIndex
        });

        this.connections[connection.id] = connection;
        this.cards[start].addChild(connection);
        this.cards[end].addParent(connection);

    }

    removeConnection(ids) {
        var self = this;
        var affectedChildren = [];
        ids.forEach(function (id) {
            var connection = self.connections[id];
            self.cards[connection.start].removeChild(connection);
            self.cards[connection.end].removeParent(connection);
            affectedChildren.push(connection.end);
            delete self.connections[id];
        });

        return affectedChildren;
    }

    addPanel(id, layout, title) {
        this.panels[id] = {layout: layout, visualizationIDs: [], title:title};
    }

    addLayer() {
        var id = Math.max(Object.keys(this.layers))+1;
        this.panels[id] = {layout: layout, visualizationIDs: []};
    }

    addGrammarPanel(panelObj){
        this.panels[panelObj.id] = panelObj;
    }

    addVizToPanel(panelID, id) {
        this.panels[panelID].visualizationIDs.push(id);
    }
}

module.exports = DataFlowDiagram;


