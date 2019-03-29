'use strict';
let ReactInputWrapper = require('./ReactInputWrapper');
let VisualizationOptions = require('../../constants/VisualizationOptions');
let actionTypes = require("../../actions/ActionTypes");

let RadioList = require('../../containers/Options/CustomOptions/RadioList');
let Checkbox = require('../../containers/Options/CustomOptions/Checkbox');
let CheckboxList = require('../../containers/Options/CustomOptions/CheckboxList');
let Select = require('../../containers/Options/CustomOptions/Select');
let Input = require('../../containers/Options/CustomOptions/Input');
let InputList = require('../../containers/Options/CustomOptions/InputList');

class VisualOptionsPanel {

    constructor(nodeDOM, cardGeneralOptions, cardSpecificOptions, cardId, dispatch) {
        let optionsContent =
            '<div class="col">' +
            ' <div class="form-horizontal">' +
            ' </div>' +
            '</div>';

        $(nodeDOM).append(optionsContent);
        this.optionsContainer = $(nodeDOM).find('.form-horizontal');
        this.options = [];
        this.cardGeneralOptions = cardGeneralOptions;
        this.cardSpecificOptions = cardSpecificOptions;
        this.cardId = cardId;
        this.components = [];
        this.dispatch = dispatch;
    }

    onUpdateOption(optionIndex) {
        let self = this;
        return function (propertyName, value) {
            self.dispatch({
                type: actionTypes.MOD_OPTION,
                cardID: self.cardId,
                id: optionIndex,
                option: {[propertyName]: value}
            });

            self.cardSpecificOptions[optionIndex] =  Object.assign({}, self.cardSpecificOptions[optionIndex], {[propertyName]: value});
            self.components[optionIndex].options.specificOptions = self.cardSpecificOptions[optionIndex];
            self.components[optionIndex].render();
        }
    }

    show() {
        let self = this;
        this.cardGeneralOptions.forEach(function (option, i) {
            let options = {
                key: self.cardId + " - " + i,
                generalOptions: option,
                specificOptions: self.cardSpecificOptions[i],
                uniqueIndex: "radio" + i + self.cardId,
                onUpdateOption: self.onUpdateOption(i),
                inPanel: true
            };
            let container = $('<div></div>').appendTo(self.optionsContainer);
            switch (option.type) {
                case VisualizationOptions.RADIO_LIST:
                    self.components.push(new ReactInputWrapper(container, RadioList, options));
                    break;
                case VisualizationOptions.RANGE_SLIDER:
                    self.components.push(new ReactInputWrapper(container, RadioList, options));
                    break;
                case VisualizationOptions.CHECKBOX:
                    self.components.push(new ReactInputWrapper(container, Checkbox, options));
                    break;
                case VisualizationOptions.CHECKBOX_LIST:
                    self.components.push(new ReactInputWrapper(container, CheckboxList, options));
                    break;
                case VisualizationOptions.SELECT:
                    self.components.push(new ReactInputWrapper(container, Select, options));
                    break;
                case VisualizationOptions.INPUT:
                    self.components.push(new ReactInputWrapper(container, Input, options));
                    break;
                case VisualizationOptions.INPUT_LIST:
                    self.components.push(new ReactInputWrapper(container, InputList, options));
                    break;
            }
        });

        this.components.forEach(function (component) {
            component.render();
        })
    }

    hide() {

    }

}

module.exports = VisualOptionsPanel;