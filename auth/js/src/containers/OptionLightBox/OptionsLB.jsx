'use strict';
var VisualizationOptions = require('../../constants/VisualizationOptions');
var ActionTypes = require('../../actions/ActionTypes');
var React = require('react');
var connect = require("react-redux").connect;
var CardTypes = require('../../constants/VisualizationOptions');
var Input = require('./OptionContainer/Input');
var InputList = require('./OptionContainer/InputList');
var Checkbox = require('./OptionContainer/Checkbox');
var CheckboxList = require('./OptionContainer/CheckboxList');
var RadioList = require('./OptionContainer/RadioList');
var RangeSlider = require('./OptionContainer/RadioList');
var Select = require('./OptionContainer/Select');
var vizParams = require('../../constants/CardsSchema');

var OptionsLB = React.createClass({

    getInitialState: function () {
        return {generalOptions: {}, cardType: "", identifier: ""}
    },

    onClose: function () {
        this.props.dispatch({type: ActionTypes.OPTION_HIDE_LB});
    },

    onIdentifierChange: function () {
        var self = this;
        return function (e) {
            self.setState({identifier: e.target.value});
        }
    },

    onGeneraOptionChange: function (index, property) {
        var self = this;
        return function (e) {
            self.state.generalOptions[property] = e.target.value;
            self.setState({generalOptions: self.state.generalOptions});
        }
    },

    onComponentChange: function () {
        var self = this;
        return function (e) {
            var generalOptions = self.state.generalOptions;
            generalOptions.type = e.target.value;
            self.setState({cardType: e.target.value});
        }
    },

    onComponentChangeId: function () {
        var self = this;
        return function (e) {
            var ids = e.target.value.split('#$#');
            var optionIndex = parseInt(ids[0]);
            var cardId = parseInt(ids[1]);
            var card = self.props.cards.byId[cardId];

            var generalOptions;
            var identifier;
            var type;

            if (card.type === "data_input") {
                generalOptions = self.props.options[cardId][optionIndex];
                generalOptions.type = "data_input";
                generalOptions.originalId = cardId;
                identifier = self.props.options[cardId][optionIndex].id;
                type = "data_input";
            } else {
                generalOptions = vizParams.cards[card.type].options[optionIndex];
                identifier = self.props.options[cardId][optionIndex].id;
                type = generalOptions.type;
            }

            self.setState({
                cardType: type,
                generalOptions: generalOptions,
                identifier: identifier
            });
        }
    },

    onAddOption: function () {
        var optionsDesc = this.state.generalOptions;
        var options = optionsDesc.type === "data_input" ? optionsDesc :
            VisualizationOptions.generateOption(optionsDesc);
        options.id = this.state.identifier;

        var joinedOptions = Object.assign(options, optionsDesc);

        this.props.dispatch({
            type: ActionTypes.SET_CARD_OPTIONS,
            id: this.props.cardId,
            options: (this.props.options[this.props.cardId] || []).concat([joinedOptions])
        });

        this.onClose();
    },

    render: function () {
        var self = this;
        var content = <div></div>;
        if (this.props.showOptionsLB) {

            var cardOptionsWithId = [];

            Object.keys(this.props.options).forEach(function (cardId) {
                var options = self.props.options[cardId];
                var card = self.props.cards.byId[cardId];
                options.forEach(function (option, index) {
                    if (option.id && card.type !== "options")
                        cardOptionsWithId.push({
                            cardId: cardId,
                            optionId: option.id,
                            optionIndex: index,
                            type: option.type
                        })
                })
            });

            var identifierStep;
            var descriptionStep;
            if (this.state.cardType !== "") {
                var optionsForm;
                switch (this.state.cardType) {
                    case CardTypes.INPUT:
                        optionsForm = <Input option={this.state.generalOptions}
                                             onValueChange={this.onGeneraOptionChange}/>;
                        break;
                    case CardTypes.INPUT_LIST:
                        optionsForm =
                            <InputList option={this.state.generalOptions}
                                       onValueChange={this.onGeneraOptionChange}/>;
                        break;
                    case CardTypes.CHECKBOX:
                        optionsForm = <Checkbox option={this.state.generalOptions}
                                                onValueChange={this.onGeneraOptionChange}/>;
                        break;
                    case CardTypes.CHECKBOX_LIST:
                        optionsForm =
                            <CheckboxList option={this.state.generalOptions}
                                          onValueChange={this.onGeneraOptionChange}/>;
                        break;
                    case CardTypes.RADIO_LIST:
                        optionsForm =
                            <RadioList option={this.state.generalOptions}
                                       onValueChange={this.onGeneraOptionChange}/>;
                        break;
                    case CardTypes.RANGE_SLIDER:
                        optionsForm =
                            <RangeSlider option={this.state.generalOptions}
                                         onValueChange={this.onGeneraOptionChange}/>;
                        break;
                    case CardTypes.SELECT:
                        optionsForm = <Select option={this.state.generalOptions}
                                              onValueChange={this.onGeneraOptionChange}/>;
                        break;
                    case "data_input":
                        optionsForm = (
                            <div className="alert alert-info">No customization available</div>
                        );
                        break;
                    default:
                        optionsForm = (
                            <div></div>
                        );
                        break;

                }

                descriptionStep = (
                    <div className="col-12 pl-4">
                        <div className="d-flex align-items-center">
                            <span className="badge badge-primary mr-2">2</span>
                            <span>Fill the description</span>
                        </div>
                        <div className="pl-4 pt-2">
                            {optionsForm}
                        </div>
                    </div>
                );

                identifierStep = (
                    <div className="col-12 pl-4">
                        <div className="d-flex align-items-center">
                            <span className="badge badge-primary mr-2">3</span>
                            <span>Set the option identifier</span>
                        </div>
                        <div className="pl-4 pt-2">
                            <input className="form-control" defaultValue={this.state.identifier}
                                   onChange={this.onIdentifierChange()}/>
                            <small>It must be the same as the option to be controlled</small>
                        </div>
                    </div>
                );
            }

            content = (
                <div className="option-creator">
                    <div className="card bg-dark">
                        <div className="card-header d-flex justify-content-between align-items-center text-white">
                            <h4>Add option</h4>
                            <i className="fa fa-times" onClick={this.onClose}/>
                        </div>
                        <div className="card-body bg-white">
                            <div className="col-12 pl-4 mb-3 mt-2">
                                <div className="d-flex align-items-center">
                                    <span className="badge badge-primary mr-2">1</span>
                                    <div className="d-flex justify-content-between">
                                        <span>Select option type</span>
                                        <span className="pl-2 pr-2" style={{fontStyle: "italic"}}>or</span>
                                        <span>copy an option with an already defined id</span>
                                    </div>
                                </div>
                                <div className="pl-4 pt-1 pb-2 d-flex align-items-center">

                                    <select className="custom-select" onChange={this.onComponentChange()}>
                                        {
                                            [<option value={"default"} disabled selected>Select
                                                option
                                                type</option>].concat(Object.keys(VisualizationOptions.component_type)
                                                                            .map(function (optionKey) {
                                                                                return (
                                                                                    <option value={optionKey}>
                                                                                        {VisualizationOptions.component_type[optionKey]}
                                                                                    </option>
                                                                                );
                                                                            }))
                                        }
                                    </select>

                                    <h6 className="pl-2 pr-2 mb-0" style={{fontStyle: "italic"}}>or</h6>

                                    <select className="custom-select" onChange={this.onComponentChangeId()}>
                                        {
                                            [<option value={"default"} disabled selected>Select option with id</option>]
                                                .concat(cardOptionsWithId.map(function (optionDesc) {
                                                    return (
                                                        <option
                                                            value={optionDesc.optionIndex + "#$#" + optionDesc.cardId}>
                                                            {optionDesc.optionId + "(" + optionDesc.type + ")"}
                                                        </option>
                                                    );
                                                }))
                                        }
                                    </select>
                                </div>
                            </div>
                            {descriptionStep}
                            {identifierStep}
                        </div>
                        <div className="card-footer d-flex justify-content-end bg-light">
                            <button className="btn btn-sm btn-secondary mr-2" onClick={this.onClose}>Cancel</button>
                            <button className="btn btn-sm btn-primary" onClick={this.onAddOption}>Add</button>
                        </div>
                    </div>
                </div>
            );
        }

        return content;

    }
});


function mapStateToProps(state) {
    return {
        cardId: state.ui.optionsLBCardId,
        cards: state.cards,
        options: state.options,
        showOptionsLB: state.ui.showOptionsLB
    };
}

module.exports = connect(mapStateToProps)(OptionsLB);
