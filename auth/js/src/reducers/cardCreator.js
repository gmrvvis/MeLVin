var actionTypes = require('../actions/ActionTypes');
var CardBuilderActions = require('../actions/CardBuilderActionTypes');
var mergeValue = require('../store/mergeValue');
var ConnectionTypes = require('./../constants/ConnectionTypes');

var initialState = {
    step: 1,
    stepState: {
        "1": {openLeft: 1, openRight: 1},
        "2": {open: 0},
        "3": {open: 0},
        "4": {open: 0},
        "5": {open: 0, options: []}
    },
    schema: {
        title: "",
        description: "",
        runOn: "javascript",
        allowOutConn: true,
        allowInConn: true,
        outConnections: [{
            type: ConnectionTypes.OPTION_CONNECTION,
            name: "Option",
            desc: "List of options",
            disabled: true
        }],
        inConnections: [{
            type: ConnectionTypes.OPTION_CONNECTION,
            unique: true,
            name: "Option",
            desc: "List of options",
            disabled: true
        }],
        shareSelection: false,
        shareData: true,
        category: "card",
        selectedLibs: [],
        previewDataFile: "",
        selectedPreview: "",
        method: {
            code: "",
            args: [
                {name: "input"},
                {name: "state"},
                {name: "dataHandler"},
                {name: "setResult"},
                {name: "setProgress"}
            ]
        },
        options: []
    },
    canBeLoaded: false
};

function cardCreator(state, action) {
    state = state || initialState;

    switch (action.type) {

        case CardBuilderActions.CLEAR_CREATOR:
            return Object.assign({}, initialState);

        case CardBuilderActions.STEP_VIZ_CREATOR:
            return Object.assign({}, state, {step: action.step});

        case CardBuilderActions.UPDATE_FIELD_VIZ:
            return mergeValue(state, ["schema", action.fieldName], action.value);

        case CardBuilderActions.VIZCREATOR_ADD_CONN:
            var connName = action.direction === "in" ? "inConnections" : "outConnections";
            var connections = state.schema[connName].concat({
                type: ConnectionTypes.DATA_CONNECTION,
                unique: true
            });
            return mergeValue(state, ["schema", connName], connections);

        case CardBuilderActions.VIZCREATOR_MOD_CONN:
            var connName = action.direction === "in" ? "inConnections" : "outConnections";
            var connections = state.schema[connName].concat();
            connections[action.index] =
                Object.assign({}, state.schema[connName][action.index], {
                    [action.fieldName]: action.value
                });
            return mergeValue(state, ["schema", connName], connections);

        case CardBuilderActions.VIZCREATOR_RM_CONN:
            var connName = action.direction === "in" ? "inConnections" : "outConnections";
            var connections = state.schema[connName].concat([]);
            connections.splice(action.index, 1);
            return mergeValue(state, ["schema", connName], connections);

        case CardBuilderActions.MOD_METHOD_CODE:
            return mergeValue(state, ["schema", "method", "code"], action.code);

        case CardBuilderActions.ADD_CARD_OPTION:
            var options = state.schema.options.concat();
            if (action.index >= 0)
                options[action.index] = {type: action.optionType};
            else
                options.push({type: action.optionType});

            return mergeValue(state, ["schema", "options"], options);

        case CardBuilderActions.RM_CARD_OPTION:
            var options = state.schema.options.concat();
            options.splice(action.index, 1);
            return mergeValue(state, ["schema", "options"], options);

        case CardBuilderActions.MOD_CARD_OPTION:
            var options = state.schema.options.concat();
            options[action.index] = Object.assign({}, options[action.index], {[action.prop]: action.value});
            return mergeValue(state, ["schema", "options"], options);

        case CardBuilderActions.SELECT_PREVIEW_FILE:
            return mergeValue(state, ["schema", "previewDataFile"], action.filename);

        case CardBuilderActions.MOD_STEP_CONFIG:
            var stepConfig = Object.assign({}, state.stepState[action.stepID], action.config);
            return mergeValue(state, ["stepState", action.stepID], stepConfig);

        //TODO: review if should deep copy
        case CardBuilderActions.EDIT_CUSTOMVIZ:
            var newSchema = Object.assign({}, action.schema);
            newSchema.method.code = newSchema.method.code;
            return Object.assign({}, state, {schema: newSchema});

        case CardBuilderActions.SHOW_VIZ_CREATOR:
            return Object.assign({}, state, {showCardCreator: true});

        case CardBuilderActions.HIDE_VIZ_CREATOR:
            return Object.assign({}, state, {showCardCreator: false});

        default:
            return state
    }
}

module.exports = cardCreator;