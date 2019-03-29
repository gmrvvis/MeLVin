var actionTypes = require('../actions/ActionTypes');

var initialState = {showGrammarEditor: false};

function grammar(state, action) {
    state = state || initialState;

    switch (action.type) {


        // case types.SAVE_GRAMMAR:
        //     var newBoard = new Board({id: "id"});
        //     newBoard.importBoard(JSON.parse(action.grammar));
        //     return Object.assign({}, state, {boardData: newBoard});

        case actionTypes.SHOW_GRAMMAR_EDITOR:
            return Object.assign({}, state, {showGrammarEditor: true});

        case actionTypes.HIDE_GRAMMAR_EDITOR:
            return Object.assign({}, state, {showGrammarEditor: false});

        default:
            return state
    }
}


module.exports = grammar;