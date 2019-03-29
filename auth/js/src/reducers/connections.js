var actionTypes = require('../actions/ActionTypes');
var initialState = {byId: {}, allIds: [], highlighted: []};

function connections(state, action) {
    state = state || initialState;

    switch (action.type) {

        case actionTypes.ADD_CONNECTION:
            var id = action.start + "" + action.end + "" + action.connType;
            var byId = Object.assign({}, state.byId, {
                [id]: {
                    id: id,
                    start: action.start,
                    end: action.end,
                    type: action.connType,
                    color: action.color,
                    startIndex: action.startIndex,
                    endIndex: action.endIndex
                }
            });
            var allIds = state.allIds.indexOf(id) === -1 ? state.allIds.concat([id]) : state.allIds.concat([]);

            return Object.assign({}, state, {byId: byId, allIds: allIds});


        case actionTypes.REMOVE_CONNECTION:
            var byId = Object.assign({}, state.byId);
            action.ids.forEach(function (id) {
                delete byId[id];
            });

            var allIds = state.allIds.concat([]);
            allIds = allIds.filter(function (id) {
                return action.ids.indexOf(id) === -1;
            });

            return Object.assign({}, state, {byId: byId, allIds: allIds});


        case actionTypes.HIGHLIGHT_CONNECTION:
            return Object.assign({}, state, {highlighted: state.highlighted.concat(action.ids)});


        case actionTypes.UNHIGHLIGHT_CONNECTION:
            var highlighted = state.highlighted.concat([]);
            highlighted = highlighted.filter(function (id) {
                return action.ids.indexOf(id) === -1;
            });

            return Object.assign({}, state, {highlighted: highlighted});

        case actionTypes.REMOVE_CARD:
            var byId = Object.assign({}, state.byId);
            var removedIds = [];
            state.allIds.forEach(function (id) {
                if (byId[id].start === action.id || byId[id].end === action.id) {
                    delete byId[id];
                    removedIds.push(id);
                }
            });

            var allIds = state.allIds.concat([]);
            allIds = allIds.filter(function (id) {
                return removedIds.indexOf(id) === -1;
            });

            return Object.assign({}, state, {byId: byId, allIds: allIds});


        case actionTypes.REMOVE_ALL_CARDS:
            return Object.assign({}, state, {byId: {}, allIds: []});

        default:
            return state
    }
}

module.exports = connections;