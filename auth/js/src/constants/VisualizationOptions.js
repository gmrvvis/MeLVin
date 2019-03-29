var CHECKBOX = 'CHECKBOX';
var SELECT = 'SELECT';
var CHECKBOX_LIST = 'CHECKBOX_LIST';
var INPUT = 'INPUT';
var RADIO_LIST = 'RADIO_LIST';
var INPUT_LIST = 'INPUT_LIST';
var RANGE_SLIDER = 'RANGE_SLIDER';

var component_type = {
    CHECKBOX: 'Checkbox',
    SELECT: 'Select',
    CHECKBOX_LIST: 'Checkbox list',
    INPUT: 'Input',
    INPUT_LIST: 'Input list',
    RANGE_SLIDER: 'Range slider',
    RADIO_LIST: 'Radiobutton list'
};

function generateOption(baseOption) {
    var option = {};

    switch (baseOption.type) {
        case CHECKBOX:
            option = {checked: baseOption.checked, locked: false};
            break;
        case SELECT:
            option = {selectedIndex: baseOption.selectedIndex, locked: false};
            break;
        case CHECKBOX_LIST:
            var checked = baseOption.states.split(', ').join(',').split(' ,').join(',').split(',').map(function (value) {
                return value === '1'
            });
            option = {checked: checked, locked: false};
            break;
        case INPUT:
            option = {value: "", locked: false};
            break;
        case INPUT_LIST:
            option = {value: [], locked: false};
            break;
        case RANGE_SLIDER:
            break;
        case RADIO_LIST:
            option = {selectedIndex: baseOption.selectedIndex, locked: false};
            break;
    }

    return option;
};

var attribute_type = {
    "$attributes": {name: "All attributes", value: "$attributes"},
    "$categoricalAttrs": {name: "Categorical attributes", value: "$categoricalAttrs"},
    "$quantitativeAttrs": {name: "Quantitative attributes", value: "$quantitativeAttrs"}
};

var argument_type = {
    "#container": {name: "container", value: "#container"},
    "#data": {name: "data", value: "#data"},
    "#attributes": {name: "attributes", value: "#attributes"},
    "#options": {name: "options", value: "#options"},
    "#selections": {name: "selections", value: "#selections"},
};

var VisualizationOptions = {
    component_type,
    CHECKBOX,
    SELECT,
    CHECKBOX_LIST,
    INPUT,
    RANGE_SLIDER,
    INPUT_LIST,
    RADIO_LIST,
    attribute_type,
    argument_type,
    generateOption
};

module.exports = VisualizationOptions;