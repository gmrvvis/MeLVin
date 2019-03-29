var actionTypes = require('../actions/ActionTypes');
var VisualizationBuilderActions = require('../actions/VisualizationBuilderActions');
var mergeValue = require('../store/mergeValue');
var ConnectionTypes = require('./../constants/ConnectionTypes');

var initialState = {
    step: 1,
    stepState: {
        "1": {openLeft: 1, openRight: 1},
        "2": {open: 0},
        "3": {open: 0},
        "4": {open: "init"}
    },
    schema: {
        title: "",
        description: "",
        className: "",
        allowOutConn: true,
        allowInConn: true,
        outConnections: [{type:ConnectionTypes.OPTION_CONNECTION, name:"Option", desc:"List of options", disabled:true}],
        inConnections: [{type:ConnectionTypes.OPTION_CONNECTION, unique:true, name:"Option", desc:"List of options",disabled:true}],
        shareSelection: false,
        shareData: true,
        category: "viz",
        selectedLibs: [],
        previewDataFile: "",
        selectedPreview: "",
        methods: {
            init: {
                code: "",
                args: "container, input, state, dataHandler, setProperty",
                isRemovable: false,
                hasCustomArgs: false,
                canBeRenamed: false
            },
            update: {
                code: "",
                args: "container, input, state, dataHandler, setProperty",
                isRemovable: false, hasCustomArgs: false, canBeRenamed: false
            },
        },
        options: []
    },
    canBeLoaded: false
};

function visualizationCreator(state, action) {
    state = state || initialState;

    switch (action.type) {

        case actionTypes.CLEAR_CREATOR:
            return Object.assign({}, initialState);

        case actionTypes.SHOW_VIZ_CREATOR:
            return Object.assign({}, state, {showVizCreator: true});

        case actionTypes.HIDE_VIZ_CREATOR:
            return Object.assign({}, state, {showVizCreator: false});

        case actionTypes.STEP_VIZ_CREATOR:
            return Object.assign({}, state, {step: action.step});

        case actionTypes.UPDATE_FIELD_VIZ:
            return mergeValue(state, ["schema", action.fieldName], action.value);

        case actionTypes.VIZCREATOR_ADD_CONN:
            var connName = action.direction === "in" ? "inConnections" : "outConnections";
            var connections = state.schema[connName].concat({
                type: ConnectionTypes.DATA_CONNECTION,
                unique: true
            });
            return mergeValue(state, ["schema", connName], connections);

        case actionTypes.VIZCREATOR_MOD_CONN:
            var connName = action.direction === "in" ? "inConnections" : "outConnections";
            var connections = state.schema[connName].concat();
            connections[action.index] =
                Object.assign({}, state.schema[connName][action.index], {
                    [action.fieldName]: action.value
                });
            return mergeValue(state, ["schema", connName], connections);

        case actionTypes.VIZCREATOR_RM_CONN:
            var connName = action.direction === "in" ? "inConnections" : "outConnections";
            var connections = state.schema[connName].concat([]);
            connections.splice(action.index, 1);
            return mergeValue(state, ["schema", connName], connections);

        case actionTypes.MOD_METHOD_ARGS:
            return mergeValue(state, ["schema", "methods", action.name, "args"], action.args);

        case actionTypes.MOD_METHOD_CODE:
            return mergeValue(state, ["schema", "methods", action.name, "code"], action.code);

        case actionTypes.ADD_CARD_OPTION:
            var options = state.schema.options.concat();
            if (action.index >= 0)
                options[action.index] = {type: action.optionType};
            else
                options.push({type: action.optionType});

            return mergeValue(state, ["schema", "options"], options);

        case actionTypes.RM_CARD_OPTION:
            var options = state.schema.options.concat();
            options.splice(action.index, 1);
            return mergeValue(state, ["schema", "options"], options);

        case actionTypes.MOD_CARD_OPTION:
            var options = state.schema.options.concat();
            options[action.index] = Object.assign({}, options[action.index], {[action.prop]: action.value});
            return mergeValue(state, ["schema", "options"], options);

        case actionTypes.SELECT_PREVIEW_FILE:
            return mergeValue(state, ["schema", "previewDataFile"], action.filename);

        case actionTypes.MOD_STEP_CONFIG:
            var stepConfig = Object.assign({}, state.stepState[action.stepID], action.config);
            return mergeValue(state, ["stepState", action.stepID], stepConfig);

        case actionTypes.EDIT_CUSTOMVIZ:
            var newSchema = Object.assign({}, action.schema);
            Object.keys(newSchema.methods).forEach(function (methodName) {
                newSchema.methods[methodName].code = newSchema.methods[methodName].code
            });
            return Object.assign({}, state, {schema: newSchema});

        case VisualizationBuilderActions.ADD_METHOD:
            var methodName = "placeHolderName" + Object.keys(state.schema.methods).length;
            var newMethod = {code: "", args: [], isRemovable: true, hasCustomArgs: true, canBeRenamed: true};
            return mergeValue(mergeValue(state, ["schema", "methods", methodName], newMethod),
                ["stepState", "4", "open"], methodName);

        case VisualizationBuilderActions.REMOVE_METHOD:
            var methods = Object.assign({}, state.schema.methods);
            delete methods[action.methodName];
            return mergeValue(state, ["schema", "methods"], methods);

        case VisualizationBuilderActions.RENAME_METHOD:
            var newState = state;
            if (Object.keys(state.schema.methods).indexOf(action.newName) === -1) {
                var oldMethod = Object.assign({}, state.schema.methods[action.methodName]);
                var methods = Object.assign({}, state.schema.methods);
                delete methods[action.methodName];
                methods = Object.assign({}, methods, {[action.newName]: oldMethod});

                var newState = mergeValue(state, ["schema", "methods"], methods);
                if (state.stepState["4"].open === action.methodName)
                    mergeValue(newState, ["stepState", "4", "open"], action.newName);
            }
            return newState;

        default:
            return state
    }
}

module.exports = visualizationCreator;