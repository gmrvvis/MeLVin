'use strict';

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var VisualizationOptions = require('../../../constants/VisualizationOptions');
var RadioList = require('../CustomOptions/RadioList');
var Checkbox = require('../CustomOptions/Checkbox');
var CheckboxList = require('../CustomOptions/CheckboxList');
var Select = require('../CustomOptions/Select');
var Input = require('../CustomOptions/Input');
var InputList = require('../CustomOptions/InputList');
var vizParams = require('../../../constants/CardsSchema');
var DataInput = require('./DataInputOptions');

var CustomCardOptions = React.createClass({

    onUpdateOption: function (optionID, optionIdentifier) {
        var self = this;
        return function (propertyName, value) {
            self.props.dispatch({
                type: ActionTypes.MOD_OPTION,
                cardID: self.props.selectedCard,
                id: optionID,
                option: {[propertyName]: value},
                optionId: optionIdentifier
            })
        }
    },

    onUpdateFOption: function (optionID, optionIdentifier) {
        var self = this;
        return function (value) {
            self.props.dispatch({
                type: ActionTypes.MOD_OPTION,
                cardID: self.props.selectedCard,
                id: optionID,
                option: value,
                optionId: optionIdentifier
            })
        }
    },

    render: function () {
        var self = this;
        var components = [];
        var cardGeneralOptions = (this.props.cardGeneralOptions ||
            vizParams.cards[this.props.cards.byId[this.props.selectedCard].type].options);
        var cardSpecificOptions = this.props.options[this.props.selectedCard];

        try {
            cardGeneralOptions.forEach(function (option, i) {
                switch (option.type) {
                    case VisualizationOptions.RADIO_LIST:
                        components.push(
                            <RadioList key={self.props.selectedCard + " - " + i}
                                       generalOptions={option}
                                       specificOptions={cardSpecificOptions[i]}
                                       uniqueIndex={"radio" + i + self.props.selectedCard}
                                       onUpdateOption={self.onUpdateOption(i, option.id)}
                                       inPanel={self.props.inPanel || false}
                            />
                        );
                        break;

                    case VisualizationOptions.RANGE_SLIDER:
                        //TODO: add range slider
                        {/*<RangeSlider key={self.props.selectedCard + " - " + i}*/}
                        {/*generalOptions={option}*/}
                        {/*specificOptions={cardSpecificOptions[i]}*/}
                        {/*onUpdateOption={self.onUpdateOption(i, option.id)}*/}
                        {/*inPanel={self.props.inPanel || false}*/ }
                        {/*/>*/}
                        components.push(
                            <div/>
                        );
                        break;

                    case VisualizationOptions.CHECKBOX:
                        components.push(
                            <Checkbox key={self.props.selectedCard + " - " + i}
                                      generalOptions={option}
                                      specificOptions={cardSpecificOptions[i]}
                                      onUpdateOption={self.onUpdateOption(i, option.id)}
                                      inPanel={self.props.inPanel || false}
                            />
                        );
                        break;

                    case VisualizationOptions.CHECKBOX_LIST:
                        components.push(
                            <CheckboxList key={self.props.selectedCard + " - " + i}
                                          generalOptions={option}
                                          specificOptions={cardSpecificOptions[i]}
                                          onUpdateOption={self.onUpdateOption(i, option.id)}
                                          inPanel={self.props.inPanel || false}
                            />
                        );
                        break;
                    case VisualizationOptions.SELECT:
                        components.push(
                            <Select key={self.props.selectedCard + " - " + i}
                                    generalOptions={option}
                                    specificOptions={cardSpecificOptions[i]}
                                    onUpdateOption={self.onUpdateOption(i, option.id)}
                                    inPanel={self.props.inPanel || false}
                            />
                        );
                        break;

                    case VisualizationOptions.INPUT:
                        components.push(
                            <Input key={self.props.selectedCard + " - " + i}
                                   generalOptions={option}
                                   specificOptions={cardSpecificOptions[i]}
                                   onUpdateOption={self.onUpdateOption(i, option.id)}
                                   inPanel={self.props.inPanel || false}
                            />
                        );
                        break;
                    case VisualizationOptions.INPUT_LIST:
                        components.push(
                            <InputList key={self.props.selectedCard + " - " + i}
                                       generalOptions={option}
                                       specificOptions={cardSpecificOptions[i]}
                                       onUpdateOption={self.onUpdateOption(i, option.id)}
                                       inPanel={self.props.inPanel || false}
                            />
                        );
                        break;

                    //TODO: find real default case
                    default:
                        components.push(<DataInput selectedCard={option.originalId}
                                                   alternateOptions={[option]}
                                                   inPanel={self.props.inPanel}
                                                   saveInternalState={self.onUpdateFOption(i, option.id)}
                                                   startWork={self.props.startWork}/>
                        );
                        break;
                }
            });

            var options;
            if (this.props.showRemove) {
                options = components.map(function (component, i) {
                    return (
                        <div className="d-flex flex-row card p-0 mb-3">
                            <div className="p-2 flex-grow-1">
                                {component}
                            </div>
                            <div className="d-flex align-items-center pl-2 pr-2 bg-light"
                                 style={{borderLeft: "1px solid #e0e0e0"}}>
                                <button className="btn btn-outline-danger btn-sm"
                                        onClick={self.props.onRemoveOption(i)}>
                                    <i className="fa fa-trash"/>
                                </button>
                            </div>
                        </div>
                    );
                });
            }
            else {
                options = components.map(function (component) {
                    return (
                        <div className="mb-3">
                            {component}
                        </div>
                    );
                });
            }

            return (
                <div className="pl-3 pr-3">
                    <div className="form-horizontal">
                        {options}
                    </div>
                </div>
            );
        }
        catch (err) {
            return (
                <div className="alert alert-danger">
                    <h5 className="text-center">{err.stack}</h5>
                </div>
            )
        }
    }
});

function mapStateToProps(state) {
    return {
        cards: state.cards,
        options: state.options
    };
}

module.exports = connect(mapStateToProps)(CustomCardOptions);
