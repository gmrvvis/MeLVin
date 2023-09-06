var actionTypes = require('../actions/ActionTypes');

var initialState = {byId: {}, allIds: [], lastId: 0};

function cards(state, action) {
    state = state || initialState;

    switch (action.type) {

        case actionTypes.ADD_CARD:
            var id = action.id;
            var byId = Object.assign({}, state.byId, {
                [id]: {
                    id: id,
                    posX: action.cardData.posX,
                    posY: action.cardData.posY,
                    title: action.cardData.title,
                    type: action.cardData.type,
                    category: action.cardData.category,
                    _workCounter: 0
                }
            });
            var allIds = state.allIds.indexOf(id) === -1 ? state.allIds.concat([id]) : state.allIds.concat([]);
            let nextID = -1;
            if (id > state.lastId)
                nextID = id + 1;
            else if (id < state.lastId)
                nextID = state.lastId
            else
                nextID = state.lastId + 1;


            return Object.assign({}, state, {byId: byId, allIds: allIds, lastId: nextID});

        case actionTypes.REMOVE_CARD:

            var byId = Object.assign({}, state.byId);
            delete byId[action.id];

            var allIds = state.allIds.concat([]);

            allIds = allIds.filter(function (id) {
                return id !== action.id;
            });

            return Object.assign({}, state, {byId: byId, allIds: allIds});

        case actionTypes.REMOVE_ALL_CARDS:
            return Object.assign({}, state, {byId: {}, allIds: []});

        case actionTypes.MOVE_CARD:
            var newCard = Object.assign({}, state.byId[action.id], {
                posX: action.posX,
                posY: action.posY
            });
            var byId = Object.assign({}, state.byId, {[action.id]: newCard});

            return Object.assign({}, state, {byId: byId});

        case actionTypes.FINISHED_WORK:
            var newCard = Object.assign({}, state.byId[action.id], {
                finishedWork: true
            });
            var byId = Object.assign({}, state.byId, {[action.id]: newCard});

            return Object.assign({}, state, {byId: byId});

        case actionTypes.WORK_CANCELED:
            var newCard = Object.assign({}, state.byId[action.id], {
                processing: false,
                afterProcessing: false
            });
            var byId = Object.assign({}, state.byId, {[action.id]: newCard});

            return Object.assign({}, state, {byId: byId});

        case actionTypes.SET_CARD_PROP_VIZPANEL:
        case actionTypes.SET_CARD_PROP:
            var newCard = Object.assign({}, state.byId[action.id], {
                [action.prop]: action.value
            });
            var byId = Object.assign({}, state.byId, {[action.id]: newCard});

            return Object.assign({}, state, {byId: byId});


        case actionTypes.START_WORK:
            var newCard = Object.assign({}, state.byId[action.id], {
                finishedWork: false
            });
            var byId = Object.assign({}, state.byId, {[action.id]: newCard});

            return Object.assign({}, state, {byId: byId});

        case actionTypes.VIZ_UPDATE:
            var workCounter = (state.byId[action.id]._workCounter || 0) + 1;
            var newCard = Object.assign({}, state.byId[action.id], {
                _workCounter: workCounter
            });
            var byId = Object.assign({}, state.byId, {[action.id]: newCard});

            return Object.assign({}, state, {byId: byId});

        default:
            return state
    }
}

module.exports = cards;