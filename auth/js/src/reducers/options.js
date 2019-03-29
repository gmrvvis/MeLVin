var actionTypes = require('../actions/ActionTypes');
var initialState = {};

function options(state, action) {
    state = state || initialState;

    switch (action.type) {

        // case actionTypes.UPDATE_STATE:
        //     state = Object.assign({}, initialState);
        //     return Object.assign({}, state, JSON.parse(action.workspace.session).options);

        case actionTypes.ADD_CARD:
            return Object.assign({}, state, {[action.id]: action.options});

        case actionTypes.REMOVE_CARD:
            var newState = Object.assign({}, state);
            delete newState[action.id];
            return newState;

        case actionTypes.SET_CARD_OPTIONS:
            return Object.assign({}, state, {[action.id]: action.options});

        case actionTypes.MOD_OPTION:
            var options = state[action.cardID].concat();
            options[action.id] = Object.assign({}, options[action.id], action.option);
            return Object.assign({}, state, {[action.cardID]: options});

        default:
            return state
    }
}

module.exports = options;