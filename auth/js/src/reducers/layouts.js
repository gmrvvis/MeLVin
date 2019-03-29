var actionTypes = require('../actions/ActionTypes');
var initialState = {};

function layouts(state, action) {
    state = state || initialState;

    switch (action.type) {

        // case actionTypes.UPDATE_STATE:
        //     state = Object.assign({}, initialState);
        //     return Object.assign({}, state, JSON.parse(action.workspace.session).layouts);

        case actionTypes.MOD_LAYOUT:
            return Object.assign({}, state, {[action.id]: action.layout});

        default:
            return state
    }
}

module.exports = layouts;