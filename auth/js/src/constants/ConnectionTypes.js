let DATA_CONNECTION = 'DATA_CONNECTION';
let SELECTION_CONNECTION = 'SELECTION_CONNECTION';
let COLOR_CONNECTION = 'COLOR_CONNECTION';
let OPTION_CONNECTION = 'OPTION_CONNECTION';
let FILE_CONNECTION = 'FILE_CONNECTION';
let structTypes = require('./ConnectionStructTypes').types;

let labels = {
    DATA_CONNECTION: "Data connections",
    SELECTION_CONNECTION: "Selection connections",
    COLOR_CONNECTION: "Color connections",
    OPTION_CONNECTION: "Option connections",
    FILE_CONNECTION: "File connections"
};
let labels_short = {
    DATA_CONNECTION: "Data",
    SELECTION_CONNECTION: "Selection",
    COLOR_CONNECTION: "Color",
    OPTION_CONNECTION: "Option",
    FILE_CONNECTION: 'File'
};

let types = [DATA_CONNECTION, SELECTION_CONNECTION, COLOR_CONNECTION, OPTION_CONNECTION, FILE_CONNECTION];
let defaultTypes = [DATA_CONNECTION, SELECTION_CONNECTION, COLOR_CONNECTION, OPTION_CONNECTION, FILE_CONNECTION];

let property = {
    DATA_CONNECTION: "data",
    SELECTION_CONNECTION: "selection",
    COLOR_CONNECTION: "groups",
    OPTION_CONNECTION: "options",
    FILE_CONNECTION: "file"
};

let typeFromProperty = {
    data: DATA_CONNECTION,
    selection: SELECTION_CONNECTION,
    groups: COLOR_CONNECTION,
    options: OPTION_CONNECTION,
    file: FILE_CONNECTION
};

let icons = {
    DATA_CONNECTION: "\uf0ce",
    SELECTION_CONNECTION: "\uf0b0",
    COLOR_CONNECTION: "\uf043",
    OPTION_CONNECTION: "\uf085",
    FILE_CONNECTION: "\uf15b"
};

let colors = {
    DATA_CONNECTION: "#0a0a0e", //"#1b9e77",
    SELECTION_CONNECTION: "#0a0a0e",
    COLOR_CONNECTION: "#0a0a0e",
    OPTION_CONNECTION: "#0a0a0e",
    FILE_CONNECTION: "#0a0a0e"
};


let iconsText = {
    DATA_CONNECTION: "fa fa-fw fa-table",
    SELECTION_CONNECTION: "fa fa-fw fa-filter",
    COLOR_CONNECTION: "fa fa-fw fa-tint",
    OPTION_CONNECTION: "fa fa-fw fa-cogs",
    FILE_CONNECTION: "fa fa-fw fa-file"
};

let propertyStructure = {
    DATA_CONNECTION: [],
    SELECTION_CONNECTION: [],
    COLOR_CONNECTION: [],
    OPTION_CONNECTION: [{path: ['data', 'data'], type: structTypes.ARRAY}, {
        path: ['data', 'schema'],
        type: structTypes.OBJECT
    }],
    FILE_CONNECTION: []
};

let ConnectionTypes = {
    DATA_CONNECTION,
    SELECTION_CONNECTION,
    COLOR_CONNECTION,
    OPTION_CONNECTION,
    FILE_CONNECTION,
    labels,
    labels_short,
    types,
    colors,
    icons,
    property,
    typeFromProperty,
    iconsText,
    defaultTypes,
    propertyStructure
};

module.exports = ConnectionTypes;