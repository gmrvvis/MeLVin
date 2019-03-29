var Redux = require('redux');
var cardsReducer = require('./cards');
var connectionsReducer = require('./connections');
var panelsReducer = require('./panels');
var userInterfaceReducer = require('./interface');
var grammarReducer = require('./grammar');
var cardCreatorReducer = require('./cardCreator');
var visualizationCreatorReducer = require('./visualizationCreator');
var connectionCreatorReducer = require('./connectionCreator');
var optionsReducer = require('./options');
var layoutsReducer = require('./layouts');
var layersReducer = require('./layers');


module.exports = Redux.combineReducers({
    cards: cardsReducer,
    connections: connectionsReducer,
    panels: panelsReducer,
    options: optionsReducer,
    layouts: layoutsReducer,
    layers: layersReducer,
    ui: userInterfaceReducer,
    grammar: grammarReducer,
    cardCreatorSchema: cardCreatorReducer,
    visualizationCreatorSchema: visualizationCreatorReducer,
    connectionCreatorSchema: connectionCreatorReducer
});