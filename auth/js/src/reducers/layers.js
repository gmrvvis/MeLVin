var actionTypes = require('../actions/ActionTypes');
var initialState = {byId: {}, allIds: [], lastID: 0, connections: {}, activeLayerId: "", activeBrush: false};

function layers(state, action) {
    state = state || initialState;

    switch (action.type) {

        case actionTypes.ADD_GRAMMAR_LAYER:
            var connections = Object.assign({}, state.connections, {[state.lastID]: action.layer.cardIds});
            delete action.layer.cardIds;
            var byId = Object.assign({}, state.byId, {
                [state.lastID]: action.layer
            });
            var allIds = state.allIds.concat([]);
            allIds.push(state.lastID);
            //TODO: change last ID
            return Object.assign({}, state, {
                byId: byId,
                connections: connections,
                allIds: allIds,
                lastID: state.lastID + 1
            });


        case actionTypes.REMOVE_ALL_LAYERS:
           return Object.assign({}, state, initialState);


        case actionTypes.ADD_LAYER:
            var byId = Object.assign({}, state.byId, {
                [action.id]: {
                    title: "New layer",
                    color: "#000000",
                    visibility: false,
                    id: action.id
                }
            });
            var connections = Object.assign({}, state.connections, {[action.id]: []});
            var allIds = state.allIds.concat([]);
            allIds.push(action.id);
            return Object.assign({}, state, {
                byId: byId,
                connections: connections,
                allIds: allIds,
                lastID: state.lastID + 1
            });

        case actionTypes.REMOVE_LAYER:
            var byId = Object.assign({}, state.byId);
            delete byId[action.id];
            var connections = Object.assign({}, state.connections);
            delete connections[action.id];
            var allIds = state.allIds.concat([]);
            allIds = allIds.filter(function (id) {
                return id !== action.id;
            });

            return Object.assign({}, state, {
                byId: byId,
                connections: connections,
                allIds: allIds
            });

        case actionTypes.SET_LAYER_PROP:
            var layer = Object.assign({}, state.byId[action.id], {[action.property]: action.value});
            var byId = Object.assign({}, state.byId, {[action.id]: layer});
            return Object.assign({}, state, {byId: byId});

        case actionTypes.ACTIVATE_LAYER:
            return Object.assign({}, state, {activeLayerId: action.id});

        case actionTypes.TOGGLE_LAYER_BRUSH:
            return Object.assign({}, state, {activeBrush: action.activeBrush});

        case actionTypes.ADD_CARD_TO_ACTIVE_LAYER:
            var connections = state.connections[action.layer].concat([]);
            if (connections.indexOf(action.id) === -1)
                connections.push(action.id);
            else
                connections = connections.filter(function (id) {
                    return id !== action.id
                });

            return Object.assign({}, state, {connections: Object.assign({}, state.connections, {[action.layer]: connections})});

        default:
            return state
    }
}

module.exports = layers;