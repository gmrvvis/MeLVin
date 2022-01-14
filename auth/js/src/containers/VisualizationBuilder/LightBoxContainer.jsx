"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var libLoader = require('../../model/LibLoader');

var StepOne = require('./DependenciesStep/DependenciesContainer');
var StepTwo = require('./DescriptionStep/Description');
var StepThree = require('./ConfigurationStep/ConfigurationContainer');
var StepFour = require('./CodeStep/CodeContainer');

var VizCreator = React.createClass({


    getInitialState: function () {
        return {fadeIn: false}
    },

    onShowDashboard: function () {
        var self = this;
        this.setState({fadeIn: false});
        setTimeout(function(){
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "Home"})
        }, 200);
    },

    onSaveConnection: function () {
        this.props.dispatch({type: ActionTypes.HIDE_VIZ_CREATOR});
        this.props.dispatch({type: ActionTypes.SEND_CUSTOM_VIZ, loadPreview: false});
    },

    onChangeStep: function (step) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.STEP_VIZ_CREATOR, step: step});
        }
    },

    onUpdateField: function () {
        var self = this;
        return function (fieldName) {
            return function (event) {
                self.props.dispatch({
                    type: ActionTypes.UPDATE_FIELD_VIZ,
                    fieldName: fieldName,
                    value: event.target.value
                });
            }
        }
    },

    onUpdateFileOption: function (fileName, properties) {
        this.props.dispatch({
            type: ActionTypes.EDIT_FILE_OPTION,
            fileName: fileName,
            properties: properties
        });
    },

    onClick: function (index, type) {
        if (type === 'lib') {
            var indexOf = this.props.schema.selectedLibs.indexOf(this.props.libFiles[index].name);
            if (indexOf >= 0) {
                this.props.schema.selectedLibs.splice(indexOf, 1)
            } else {
                this.props.schema.selectedLibs.push(this.props.libFiles[index].name);
            }

            this.props.dispatch({
                type: ActionTypes.UPDATE_FIELD_VIZ,
                fieldName: 'selectedLibs',
                value: this.props.schema.selectedLibs
            });
        }
        else {
            this.props.dispatch({
                type: ActionTypes.UPDATE_FIELD_VIZ,
                fieldName: 'selectedPreview',
                value: this.props.previewFiles[index]
            });
        }
    },

    onChangeStepProp: function (stepID) {
        var self = this;
        return function (config) {
            self.props.dispatch({type: ActionTypes.MOD_STEP_CONFIG, stepID: stepID, config: config})
        }
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.setState({fadeIn: true})
        }, 10);
    },

    onSaveViz: function () {
        this.props.dispatch({type: ActionTypes.SEND_CUSTOM_VIZ, loadPreview: true});
        // var libs = this.props.schema.selectedLibs.map(function (libName) {
        //     return self.props.libFiles[libName];
        // });
        // libLoader.loadLibraries(libs, function () {
        //     self.setState({showLoading: false, loadingInfo: ""});
        // });
        this.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "VisualizationList"})

    },

    render: function () {
        var self = this;
        var step = this.props.step;
        var stepNum = [1, 2, 3, 4];
        var ratio = (100 / (stepNum.length - 1));

        var content = [
            <StepOne config={this.props.stepState["1"]}
                     onChangeStepProp={this.onChangeStepProp("1")}
                     libFiles={this.props.libFiles}
                     previewFiles={this.props.previewFiles}
                     schema={this.props.schema}
                     onClick={this.onClick}
                     onUpdateFileOption={this.onUpdateFileOption}/>,
            <StepTwo config={this.props.stepState["2"]}
                     onChangeStepProp={this.onChangeStepProp("2")}
                     onUpdateField={this.onUpdateField()}/>,
            <StepThree config={this.props.stepState["3"]}
                       onChangeStepProp={this.onChangeStepProp("3")}
                       onUpdateField={this.onUpdateField()}/>,
            <StepFour config={this.props.stepState["4"]}
                      onChangeStepProp={this.onChangeStepProp("4")}
                      onUpdateField={this.onUpdateField()}/>
        ];
        var icons = ["folder-open", "font", "wrench", "code"];
        var stepName = ["Dependencies", "Configuration", 'Options', "Code"];

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";


        var steps = [];
        stepNum.forEach(function (numStep, i) {
            var stepClass = "step mr-2";
            if ((i + 1) > step) stepClass = "step gray mr-2";
            if ((i + 1) === step) stepClass = "step active mr-2";
            var progressClass = (i + 2) > step ? "progress-gray" : "";

            steps.push(<div className="step-container" onClick={self.onChangeStep(numStep)}>
                    <div className={stepClass}><span
                        className={"fa fa-" + icons[i]}/></div>
                    <span>{stepName[i]}</span>
                </div>
            );
            if (i !== (stepNum.length - 1))
                steps.push(<div className={"progressStep " + progressClass}/>)
        });

        return (
            <div className={"popup-content d-flex flex-column " + fadeClass}
                 style={{width: "100%", height: "calc(100vh - 55px)", backgroundColor: "#eeeeef", transition: "all 0.2s", transitionTimingFunction: "ease"}}>
                <div className="pt-3 pl-3 d-flex align-items-center">
                    <button type="button" className="btn btn-dark mr-2"
                            onClick={this.onShowDashboard}>
                        <i className="fa fa-chevron-left"/>
                    </button>
                    <h2 className="mb-0">
                        Card creation assistant - Visualization card
                    </h2>
                </div>
                <div className="flex-1 d-flex flex-row bg-white m-3 mh-0"
                     style={{
                         border: "1px solid #d4d4d4",
                         borderRadius: "4px",
                         boxShadow: "0 2px 2px 0px #d0d0d0"
                     }}>
                    <div className="step-heading bg-dark text-white">
                        <div>
                            {steps}
                        </div>
                    </div>

                    <div className="container-p h-100">
                        {content[step - 1]}
                        <div className="popup-footer">
                            {
                                step > 1 ? (<button className="btn btn-primary btn-sm" style={{marginRight: "10px"}}
                                                    onClick={this.onChangeStep(step - 1)}>
                                    <span className="fa fa-chevron-left"/> Previous
                                </button>) : (<div></div>)
                            }
                            {
                                step < stepNum.length ? (<button className="btn btn-primary btn-sm"
                                                                 onClick={this.onChangeStep(step + 1)}>{"Next "}
                                    <span className="fa fa-chevron-right"/>
                                </button>) : (<div></div>)
                            }
                            {
                                step === stepNum.length ? (<button onClick={this.onSaveViz} className="btn btn-success btn-sm">
                                    <span className="fa fa-check"/> {" Finish"}
                                </button>) : (<div></div>)
                            }
                        </div>
                    </div>

                </div>
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        showVizCreator: state.visualizationCreatorSchema.showVizCreator,
        step: state.visualizationCreatorSchema.step,
        stepState: state.visualizationCreatorSchema.stepState,
        schema: state.visualizationCreatorSchema.schema,
        libFiles: state.ui.libFiles,
        previewFiles: state.ui.previewFiles
    };
}


module.exports = connect(mapStateToProps)(VizCreator);
