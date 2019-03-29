var DATA_CONNECTION = 'DATA_CONNECTION';
var SELECTION_CONNECTION = 'SELECTION_CONNECTION';
var COLOR_CONNECTION = 'COLOR_CONNECTION';
var OPTION_CONNECTION = 'OPTION_CONNECTION';
var structTypes = require('./ConnectionStructTypes').types;

var labels = {
    DATA_CONNECTION: "Data connections",
    SELECTION_CONNECTION: "Selection connections",
    COLOR_CONNECTION: "Color connections",
    OPTION_CONNECTION: "Option connections"
};
var labels_short = {
    DATA_CONNECTION: "Data",
    SELECTION_CONNECTION: "Selection",
    COLOR_CONNECTION: "Color",
    OPTION_CONNECTION: "Option"
};

var types = [DATA_CONNECTION, SELECTION_CONNECTION, COLOR_CONNECTION, OPTION_CONNECTION];
var defaultTypes = [DATA_CONNECTION, SELECTION_CONNECTION, COLOR_CONNECTION, OPTION_CONNECTION];

var property = {
    DATA_CONNECTION: "data",
    SELECTION_CONNECTION: "selection",
    COLOR_CONNECTION: "groups",
    OPTION_CONNECTION: "options"
};

var typeFromProperty = {
    data: DATA_CONNECTION,
    selection: SELECTION_CONNECTION,
    groups: COLOR_CONNECTION,
    options: OPTION_CONNECTION
};

var icons = {
    DATA_CONNECTION: "\uf15b",
    SELECTION_CONNECTION: "\uf0b0",
    COLOR_CONNECTION: "\uf043",
    OPTION_CONNECTION: "\uf085"
};

var iconsText = {
    DATA_CONNECTION: "fa fa-fw fa-file",
    SELECTION_CONNECTION: "fa fa-fw fa-filter",
    COLOR_CONNECTION: "fa fa-fw fa-tint",
    OPTION_CONNECTION: "fa fa-fw fa-cogs"
};

var propertyStructure = {
    DATA_CONNECTION: [],
    SELECTION_CONNECTION: [],
    COLOR_CONNECTION: [],
    OPTION_CONNECTION: [{path: ['data', 'data'], type: structTypes.ARRAY}, {
        path: ['data', 'schema'],
        type: structTypes.OBJECT
    }]
};

var ConnectionTypes = {
    DATA_CONNECTION,
    SELECTION_CONNECTION,
    COLOR_CONNECTION,
    OPTION_CONNECTION,
    labels,
    labels_short,
    types,
    icons,
    property,
    typeFromProperty,
    iconsText,
    defaultTypes,
    propertyStructure
};

module.exports = ConnectionTypes;