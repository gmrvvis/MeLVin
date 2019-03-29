"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var VisualizationOptions = require('../../../constants/VisualizationOptions');
var CheckBoxPreview = require('./OptionPreview/Checkbox');
var SelectPreview = require('./OptionPreview/Select');
var CheckBoxListPreview = require('./OptionPreview/CheckboxList');
var InputPreview = require('./OptionPreview/Input');
var InputListPreview = require('./OptionPreview/InputList');
var RadioListPreview = require('./OptionPreview/RadioList');

var VizPreview = React.createClass({

    render: function () {
        var previewOptions = [];
        var attrs = ["Example attribute", "Another example", "Last example"];
        this.props.schema.options.forEach(function (option, i) {

            switch (option.type) {
                case VisualizationOptions.CHECKBOX:
                    previewOptions.push(<CheckBoxPreview option={option}/>);
                    break;
                case VisualizationOptions.SELECT:
                    previewOptions.push(<SelectPreview option={option} attrs={attrs}/>);
                    break;
                case VisualizationOptions.CHECKBOX_LIST:
                    previewOptions.push(<CheckBoxListPreview option={option} attrs={attrs}/>);
                    break;
                case VisualizationOptions.INPUT:
                    previewOptions.push(<InputPreview option={option} attrs={attrs}/>);
                    break;
                case VisualizationOptions.INPUT_LIST:
                    previewOptions.push(<InputListPreview option={option} attrs={attrs}/>);
                    break;
                case VisualizationOptions.RADIO_LIST:
                    previewOptions.push(<RadioListPreview option={option} attrs={attrs} index={i}/>);
                    break;
            }
        });

        return (
            <div style={{
                backgroundColor: "#333",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
                flexFlow: "column",
                padding: "15px"
            }} className="blueprint">
                <div style={{
                    backgroundColor: "#fff",
                    padding: "15px",
                    height: "100%",
                    overflowY: "auto",
                    width: "50%",
                    minWidth: "350px",
                }}>
                    {previewOptions}
                </div>
            </div>
        )
    }
});

function mapStateToProps(state) {
    return {
        schema: state.cardCreatorSchema.schema
    };
}


module.exports = connect(mapStateToProps)(VizPreview);
