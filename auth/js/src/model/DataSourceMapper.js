'use strict';
let DataFlowDiagram = require('./DataFlowDiagram');
let vizParams = require('../constants/CardsSchema');
let ConnectionTypes = require('./../constants/ConnectionTypes');
let ActionTypes = require('../actions/ActionTypes');

class DataStoreMapper {
    constructor() {
    }

    init(reduxStore) {
        this.reduxStore = reduxStore;
        this.dataFlowDiagram = new DataFlowDiagram({id: "main"});
    }

    resetDFD() {
        this.dataFlowDiagram = new DataFlowDiagram({id: "main"});
    }

    exportDFD() {
        var reduxState = this.reduxStore.getState();
        var grammar = {cards: [], connections: [], layers: [], panels: []};
        Object.values(this.dataFlowDiagram.cards).map(function (card) {
            var cardDesc = {
                id: card.id,
                title: card.title,
                type: card.type,
                posX: card.posX,
                posY: card.posY,
                options: card.options
            };
            if(card.type === 'options')
                cardDesc._options = card._options;
            grammar.cards.push(cardDesc);
        });

        Object.values(this.dataFlowDiagram.connections).map(function (conn) {
            grammar.connections.push({start: conn.start, end: conn.end, type: conn.type, startIndex: conn.startIndex,
                endIndex: conn.endIndex})
        });

        reduxState.layers.allIds.map(function (id) {
            var layer = reduxState.layers.byId[id];
            grammar.layers.push({
                title: layer.title,
                visibility: layer.visibility,
                color: layer.color,
                cardIds: reduxState.layers.connections[id]
            })
        });

        Object.values(this.dataFlowDiagram.panels).map(function (panel) {
            grammar.panels.push({
                title: panel.title,
                visualizationIDs: panel.visualizationIDs,
                layout: panel.layout
            })
        });

        return grammar;
    }

    importDFD(grammarJSON) {
        var self = this;
        var grammarErrors = {};
        var isValidGrammar = true;
        var dispatch = this.reduxStore.dispatch;
        try {
            var grammar = JSON.parse(grammarJSON);

            var cardTypes = grammar.cards.map(function (card) {
                return card.type;
            });

            var incorrectCardTypes = cardTypes.filter(function (cardType) {
                return vizParams.cards[cardType] === undefined;
            });

            var connTypes = grammar.connections.map(function (conn) {
                return conn.type;
            });

            var incorrectConTypes = connTypes.filter(function (connType) {
                return ConnectionTypes.property[connType] === undefined;
            });

            var connIds = grammar.cards.map(function (card) {
                return card.id;
            });

            var incorrectCardIDs = [];
            grammar.connections.forEach(function (conn) {
                if (connIds.indexOf(conn.start) === -1) incorrectCardIDs.push(conn.start);
                if (connIds.indexOf(conn.end) === -1) incorrectCardIDs.push(conn.end);
            });


            if (incorrectConTypes.length > 0 || incorrectCardTypes.length > 0 || incorrectCardIDs.length > 0) {
                if (incorrectCardTypes.length > 0)
                    grammarErrors.cards = "The following card types were not found: " + incorrectCardTypes.join(', ') + ".";
                if (incorrectConTypes.length > 0)
                    grammarErrors.conns = "The following connection types were not found: " + incorrectConTypes.join(', ') + ".";
                if (incorrectCardIDs.length > 0)
                    grammarErrors.conns = "The following card IDs, used in connections, were not found: " + incorrectCardIDs.join(', ') + ".";
                isValidGrammar = Object.keys(grammarErrors).length > 0

            } else {

                var incorrectConnections = [];

                grammar.connections.forEach(function (conn) {
                    var startType = grammar.cards.filter(function (card) {
                        return card.id === conn.start;
                    })[0].type;

                    var endType = grammar.cards.filter(function (card) {
                        return card.id === conn.end;
                    })[0].type;

                    var startConnTypes = _.map(vizParams.cards[startType].outConnections, "type");
                    var endConnTypes = _.map(vizParams.cards[endType].inConnections, "type");
                    if (startConnTypes.indexOf(conn.type) === -1) {
                        incorrectConnections.push("Cards of type '" + startType + "' cannot have '" + conn.type +
                            "' connections" + (startConnTypes.length > 0 ? (", only the following connection types are allowed: " + startConnTypes.join(", ")) : " as no output connections are allowed."))
                    }
                    if (endConnTypes.indexOf(conn.type) === -1) {
                        incorrectConnections.push("Cards of type '" + endType + "' cannot have '" + conn.type +
                            "' connections" + (endConnTypes.length > 0 ? (", only the following connection types are allowed: " + endConnTypes.join(", ")) : " as no input connection are allowed."))
                    }
                });

                if (incorrectConnections.length > 0) {
                    grammarErrors.connType = incorrectConnections;
                } else {
                    var posX = 0;
                    var posY = 0;
                    dispatch({type: ActionTypes.REMOVE_ALL_CARDS});
                    grammar.cards.forEach(function (card, i) {
                        dispatch({
                            type: ActionTypes.ADD_CARD, id: card.id, cardData: {
                                posX: card.posX !== undefined ? card.posX : posX,
                                posY: card.posY !== undefined ? card.posY : posY,
                                title: card.title,
                                type: card.type,
                                category: vizParams.cards[card.type].category
                            }
                        });

                        dispatch({
                            type: ActionTypes.SET_CARD_OPTIONS, id: card.id, options: card.options
                        });

                        if ((i + 1) % 4 === 0) posX += 1;
                        posY = (i + 1) % 4;
                    });

                    grammar.cards.forEach(function (card, i) {
                        dispatch({
                            type: ActionTypes.SET_CARD_OPTIONS, id: card.id, options: card.options
                        });

                    });

                    grammar.connections.forEach(function (connection) {
                        dispatch({
                            type: ActionTypes.ADD_CONNECTION,
                            start: connection.start,
                            end: connection.end,
                            startIndex: connection.startIndex,
                            endIndex: connection.endIndex,
                            connType: connection.type,
                            color: "#000"
                        })
                    });

                    dispatch({type: ActionTypes.REMOVE_ALL_PANELS});

                    grammar.panels.forEach(function (panel, i) {
                        panel.id = i;
                        dispatch({
                            type: ActionTypes.ADD_GRAMMAR_PANEL,
                            panelObj: panel
                        })
                    });

                    dispatch({type: ActionTypes.REMOVE_ALL_LAYERS});
                    grammar.layers.forEach(function (layer) {
                        dispatch({
                            type: ActionTypes.ADD_GRAMMAR_LAYER,
                            layer: layer
                        })
                    });
                }
            }
        }
        catch (e) {
            grammarErrors.JSON = e.message;
            isValidGrammar = false;
            console.log('Grammar error: ' + e.message)
        }

        return {isValidGrammar: isValidGrammar, errors: grammarErrors}
    }

}

let dataStoreMapper = new DataStoreMapper();
module.exports = dataStoreMapper;
