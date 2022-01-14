"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var VisualizationOptions = require('../../../constants/VisualizationOptions');

var CheckBoxOption = require('./OptionContainer/Checkbox');
var CheckBoxListOption = require('./OptionContainer/CheckboxList');
var SelectOption = require('./OptionContainer/Select');
var InputOption = require('./OptionContainer/Input');
var InputListOption = require('./OptionContainer/InputList');
var RadioListOption = require('./OptionContainer/RadioList');

var OptionsPreview = require('./OptionsPreview');

var Config = React.createClass({

    shouldComponentUpdate: function () {
        return true;
    },

    addOption: function (type, index) {

        this.props.dispatch({
            type: ActionTypes.ADD_CARD_OPTION,
            optionType: type,
            index: index
        });
        if (index === undefined)
            this.props.onChangeStepProp({open: this.props.schema.options.length - 1})
    },

    onRMBlock: function (index) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: ActionTypes.RM_CARD_OPTION,
                index: index
            });
        }
    },

    onOpenBlock: function (index) {
        var self = this;
        return function () {
            if (self.props.config.open === index) self.props.onChangeStepProp({open: "none"})
            else self.props.onChangeStepProp({open: index})
        }
    },

    modOption: function (index, fieldName, value) {
        this.props.dispatch({
            type: ActionTypes.MOD_CARD_OPTION,
            index: index,
            prop: fieldName,
            value: value
        })
    },

    onValueChange: function (index, fieldName) {
        var self = this;
        return function (event) {
            self.modOption(index, fieldName, event.target.value);
        }
    },

    render: function () {
        var self = this;
        return (
            <div className="container-content row wrap-cols mh-0">
                <div className="col-6 pl-2 accordion-wrapper h-100 overflow-y p-3">
                    {
                        this.props.schema.options.map(function (option, i) {
                            var open = self.props.config.open === i;
                            var content;
                            var className = "title";
                            var chevronClass = "fa fa-chevron-down";

                            if (open) {
                                className = "title open";
                                chevronClass = "fa fa-chevron-up";

                                var options;
                                var selector = (
                                    <div className="dropdown">
                                        <div style={{cursor: "pointer"}}
                                             className="dropdown-toggle btn-sm"
                                             data-toggle="dropdown">
                                            <span className="caret"/>
                                        </div>
                                        <div className="dropdown-menu">
                                            {
                                                Object.keys(VisualizationOptions.component_type).map(function (type) {
                                                    return <a className="dropdown-item"
                                                              href="#" onClick={function () {
                                                        return self.addOption(type, i)
                                                    }}>{VisualizationOptions.component_type[type]}
                                                    </a>
                                                })
                                            }
                                        </div>
                                    </div>
                                );

                                switch (option.type) {
                                    case VisualizationOptions.CHECKBOX:
                                        options = <CheckBoxOption option={option}
                                                                  onValueChange={self.onValueChange}
                                                                  modOption={self.modOption}
                                                                  index={i}/>;
                                        break;
                                    case VisualizationOptions.SELECT:
                                        options = <SelectOption option={option}
                                                                onValueChange={self.onValueChange}
                                                                modOption={self.modOption}
                                                                index={i}/>;
                                        break;
                                    case VisualizationOptions.CHECKBOX_LIST:
                                        options = <CheckBoxListOption option={option}
                                                                      onValueChange={self.onValueChange}
                                                                      modOption={self.modOption}
                                                                      index={i}/>;
                                        break;
                                    case VisualizationOptions.INPUT:
                                        options = <InputOption option={option}
                                                               onValueChange={self.onValueChange}
                                                               modOption={self.modOption}
                                                               index={i}/>;
                                        break;
                                    case VisualizationOptions.INPUT_LIST:
                                        options = <InputListOption option={option}
                                                                   onValueChange={self.onValueChange}
                                                                   modOption={self.modOption}
                                                                   index={i}/>;
                                        break;
                                    case VisualizationOptions.RADIO_LIST:
                                        options = <RadioListOption option={option}
                                                                   onValueChange={self.onValueChange}
                                                                   modOption={self.modOption}
                                                                   index={i}/>;
                                        break;
                                }

                                content = (
                                    <div className="container">
                                        {options}
                                    </div>
                                );
                            }
                            return (
                                <div className="accordion-container">
                                    <div className={className}>
                                        <div className="d-flex flex-row align-items-center" style={{flexGrow: 1}}>
                                            <h6 className="mb-0 font-weight-bold">{VisualizationOptions.component_type[option.type]}</h6>
                                            {selector}
                                        </div>
                                        <button className="btn btn-empty" onClick={self.onOpenBlock(i)}>
                                            <span className={chevronClass}/>
                                        </button>
                                        <button onClick={self.onRMBlock(i)} className="btn btn-empty">
                                            <span className="fa fa-times"/>
                                        </button>
                                    </div>
                                    {content}
                                </div>
                            )
                        }).concat([
                            <div className="accordion-container-dark">
                                <div className='title' onClick={function () {
                                    return self.addOption(Object.keys(VisualizationOptions.component_type)[0])
                                }}>
                                    <span>ADD NEW OPTION</span>
                                </div>
                            </div>
                        ])
                    }
                </div>
                <div className="col-6 pl-2 pt-3 pb-3 accordion-wrapper-preview h-100 overflow-y">
                    <div className="accordion-container d-flex flex-column h-100">
                        <div className='title open-dim d-flex justify-content-center'>
                            <h6 className="font-weight-bold pb-2 pt-2">Preview</h6>
                        </div>
                        <OptionsPreview/>
                    </div>
                </div>
            </div>)
    }
});


function mapStateToProps(state) {
    return {
        schema: state.visualizationCreatorSchema.schema
    };
}


module.exports = connect(mapStateToProps)(Config);
