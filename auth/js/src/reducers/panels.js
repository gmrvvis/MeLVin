var actionTypes = require('../actions/ActionTypes');

var initialState = {byId: {}, allIds: [], lastId: 0};

function panels(state, action) {
    state = state || initialState;

    switch (action.type) {

        case actionTypes.ADD_PANEL:
            var id = action.id;
            var byId = Object.assign({}, state.byId, {
                [id]: {
                    id: id,
                    title: action.title,
                    visualizationIDs: [],
                    sideBarOpen: false
                }
            });
            var allIds = state.allIds.indexOf(id) === -1 ? state.allIds.concat([id]) : state.allIds.concat([]);

            return Object.assign({}, state, {byId: byId, allIds: allIds, lastId: state.lastId + 1});


        case actionTypes.ADD_GRAMMAR_PANEL:
            var id = state.lastId;
            var byId = Object.assign({}, state.byId, {
                [id]: action.panelObj
            });
            var allIds = state.allIds.indexOf(id) === -1 ? state.allIds.concat([id]) : state.allIds.concat([]);

            //TODO: new last id
            return Object.assign({}, state, {byId: byId, allIds: allIds, lastId: state.lastId + 1});

        case actionTypes.REMOVE_PANEL:

            var byId = Object.assign({}, state.byId);
            delete byId[action.id];

            var allIds = state.allIds.concat([]);

            allIds = allIds.filter(function (id) {
                return id !== action.id;
            });

            return Object.assign({}, state, {byId: byId, allIds: allIds});

        case actionTypes.ADD_VIZ_TO_PANEL:
            var visualizationIDs = state.byId[action.panelID].visualizationIDs.concat([action.id]);
            var vizPanel = Object.assign({}, state.byId[action.panelID], {visualizationIDs:visualizationIDs});
            var byId = Object.assign({}, state.byId, {
                [action.panelID]: vizPanel
            });
            return Object.assign({}, state, {byId: byId});

        case actionTypes.REMOVE_VIZ_FROM_PANEL:
            var visualizationIDs = state.byId[action.panelID].visualizationIDs.concat([]);
            visualizationIDs.splice(action.vizIndex, 1);
            var vizPanel = Object.assign({}, state.byId[action.panelID], {visualizationIDs:visualizationIDs});
            var byId = Object.assign({}, state.byId, {
                [action.panelID]: vizPanel
            });
            return Object.assign({}, state, {byId: byId});


        case actionTypes.TOGGLE_PANEL_SIDEBAR:
            var vizPanel = Object.assign({}, state.byId[action.panelID], {sideBarOpen: !state.byId[action.panelID].sideBarOpen});
            var byId = Object.assign({}, state.byId, {
                [action.panelID]: vizPanel
            });
            return Object.assign({}, state, {byId: byId});

        // case actionTypes.UPDATE_STATE:
        //     state = Object.assign({}, initialState);
        //     return Object.assign({}, state, JSON.parse(action.workspace.session).panels);

        case actionTypes.REMOVE_ALL_PANELS:
            return initialState;

        default:
            return state
    }
}

module.exports = panels;