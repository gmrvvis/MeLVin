var actionTypes = require('../actions/ActionTypes');
var mergeValue = require('../store/mergeValue');
var structTypes = require('../constants/ConnectionStructTypes').types;

var initialState = {
    name: "",
    property: "",
    icon: "",
    iconUnicode: "",
    nextStructId: 1,
    structure: {0: {id: 0, type: structTypes.OBJECT, title: "", children: [], root: true, desc: ""}}
};

function connectionCreator(state, action) {
    state = state || initialState;

    switch (action.type) {

        case actionTypes.CLEAR_CONN_CREATOR:
            return Object.assign({}, initialState);

        case actionTypes.STRUCTURE_ADD_CHILD:
            var newStruct = {
                id: state.nextStructId,
                type: structTypes.OBJECT,
                title: action.title,
                children: [],
                parentId: action.id,
                desc: ""
            };
            var newChildren = state.structure[action.id].children.concat([state.nextStructId]);
            var newParentStruct = Object.assign({}, state.structure[action.id], {children: newChildren});
            var newStructure = Object.assign({}, state.structure, {[action.id]: newParentStruct});
            newStructure = Object.assign({}, newStructure, {[state.nextStructId]: newStruct});

            return Object.assign({}, state, {structure: newStructure, nextStructId: state.nextStructId + 1});

        case actionTypes.STRUCTURE_CHANGE_NODE:
            var newStructObj = Object.assign({}, state.structure[action.id], action.data);
            var newStructure = Object.assign({}, state.structure, {[action.id]: newStructObj});

            return Object.assign({}, state, {structure: newStructure});

        case actionTypes.STRUCTURE_REMOVE_ELEM:
            var parentId = state.structure[action.id].parentId;
            delete state.structure[action.id];
            var newChildren = state.structure[parentId].children.filter(function (elem) {
                return elem !== action.id;
            });
            var newStructObj = Object.assign({}, state.structure[parentId], {children: newChildren});
            var newStructure = Object.assign({}, state.structure, {[parentId]: newStructObj});

            return Object.assign({}, state, {structure: newStructure});

        case actionTypes.UPDATE_FIELD_CONN:
            var newState;
            if (action.fieldName === 'property')
                newState = Object.assign({}, state, {
                    structure:
                        Object.assign({}, state.structure, {
                            0:
                                Object.assign({}, state.structure[0], {title: action.value})
                        })
                });
            return Object.assign({}, (newState || state), {[action.fieldName]: action.value});

        case actionTypes.EDIT_CONN:
            return Object.assign({}, state, action.schema);

        case actionTypes.CONNECTION_EDIT:
            var newSchema = Object.assign({}, action.schema);
            return Object.assign({}, state, newSchema);

        default:
            return state
    }
}

module.exports = connectionCreator;