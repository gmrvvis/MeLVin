"use strict";

var React = require('react');
var CodePreview = require('./CodePreview');
var ActionTypes = require('../../../actions/ActionTypes');
var VisualizationBuilderActions = require('../../../actions/VisualizationBuilderActions');
var connect = require("react-redux").connect;
var CodeTextEditor = require("./CodeTextEditor");
var VisualizationOptions = require('../../../constants/VisualizationOptions');

var Code = React.createClass({

    getInitialState: function () {
        return {editingTitle: "none"}
    },

    onEditTitle: function (methodName) {
        var self = this;
        return function () {
            self.setState({editingTitle: methodName})
        }
    },

    onSaveTitle: function (methodName, newName) {
        this.props.dispatch({type: VisualizationBuilderActions.RENAME_METHOD, methodName: methodName, newName: newName})
    },

    onModArgs: function (methodName) {
        var self = this;
        return function (event) {
            self.props.dispatch({
                type: ActionTypes.MOD_METHOD_ARGS,
                name: methodName,
                args: event.target.value
            })
        };
    },

    onCodeChange: function (methodName) {
        var self = this;
        return function (instance, changeObj) {
            self.props.dispatch({type: ActionTypes.MOD_METHOD_CODE, name: methodName, code: instance.getValue()})
        };
    },

    onOpenBlock: function (methodName) {
        var self = this;
        return function () {
            if (self.props.config.open === methodName) self.props.onChangeStepProp({open: "none"});
            else self.props.onChangeStepProp({open: methodName})
        }
    },

    addMethod: function () {
        this.props.dispatch({
            type: VisualizationBuilderActions.ADD_METHOD
        });
    },

    onRMBlock: function (methodName) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: VisualizationBuilderActions.REMOVE_METHOD,
                methodName: methodName
            });
        }
    },


    render: function () {
        var self = this;
        return (
            <div className="container-content row wrap-cols mh-0">
                <div className="col-6 p-3 pr-2 accordion-wrapper h-100 overflow-y">
                    {
                        Object.keys(this.props.schema.methods).map(function (methodName) {
                            var open = self.props.config.open === methodName;
                            var content;
                            var className = "title";
                            var chevronClass = "fa fa-chevron-down";
                            var method = self.props.schema.methods[methodName];
                            var args;
                            var title = (
                                <div style={{flexGrow: 1, flexFlow: "row", display: "flex", alignItems: "flex-end"}}>
                                    <h5 style={{margin:0}} onClick={self.onEditTitle(methodName)}>{methodName}</h5>
                                    <span style={{
                                        color: "#696969",
                                        fontStyle: "italic",
                                        marginLeft: "10px",
                                        marginBottom: "0px"
                                    }}>(default method)</span>
                                </div>
                            );

                            if (method.canBeRenamed) {
                                title = (
                                    <div className="editable-title d-flex align-items-center">
                                        <h5 className="mb-0 mt-0"
                                            onClick={self.onEditTitle(methodName)}>{methodName}</h5>
                                        <span className="fa fa-pen" onClick={self.onEditTitle(methodName)}/>
                                    </div>
                                )
                            }

                            if (self.state.editingTitle === methodName && method.canBeRenamed)
                                title = (
                                    <div className="editable-title">
                                        <div className="input-group col-6 pl-0">
                                            <input type="text" className="form-control"
                                                   defaultValue={methodName}
                                                   onChange={function (event) {
                                                       self.newTitle = event.target.value;
                                                   }}

                                                   onKeyPress={function (event) {
                                                       if (event.key === 'Enter') {
                                                           self.onEditTitle("none")();
                                                           self.onSaveTitle(methodName, self.newTitle);
                                                           self.setState({editingTitle: "none"});
                                                       }
                                                   }}
                                            />
                                            <div className="input-group-append">
                                                <button className="btn btn-success" type="button" onClick={function () {
                                                    self.onEditTitle("none")();
                                                    self.onSaveTitle(methodName, self.newTitle);
                                                    self.setState({editingTitle: "none"});
                                                }}>
                                                    <span className="fa fa-check"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );

                            var accordionClass = "accordion-container";

                            if (open) {
                                className = "title open";
                                chevronClass = "fa fa-chevron-up";


                                if (method.hasCustomArgs) {
                                    args = (
                                        <div className="form-group">
                                            <label className="mb-0 font-weight-bold">Arguments</label>

                                                <input type="text" className="form-control"
                                                   defaultValue={method.args}
                                                   onChange={self.onModArgs(methodName)}/>
                                            <small className="form-text text-muted">
                                                Comma separated list of arguments (argName1, argName2, argName3)
                                            </small>
                                        </div>
                                    )
                                }
                                else {
                                    args = (
                                        <div className="form-group">
                                            <label className="mb-0 font-weight-bold">Arguments</label>
                                            {
                                                method.args.split(',').map(function (arg) {
                                                return <span className={"ml-2 badge badge-secondary"}>{arg}</span>
                                            })
                                            }
                                        </div>

                                    )
                                }

                                content = (
                                    <div className="container-fluid pb-3 d-flex flex-column flex-grow mh-0">
                                        <div>
                                                {args}
                                        </div>
                                        <div className="d-flex flex-column flex-grow mh-0">
                                                <label className="mb-0 font-weight-bold">Code</label>
                                                <CodeTextEditor onChange={self.onCodeChange(methodName)}
                                                                code={method.code}
                                                                mode={"javascript"}/>
                                        </div>
                                    </div>
                                );

                                accordionClass = "accordion-container d-flex flex-column flex-grow mh-0 mh-30"
                            }

                            var removeButton = (
                                <button className="btn btn-empty disabled" disabled>
                                    <span className="fa fa-times"/>
                                </button>
                            );

                            if (method.isRemovable)
                                removeButton = (
                                    <button onClick={self.onRMBlock(methodName)} className="btn btn-empty ">
                                        <span className="fa fa-times"/>
                                    </button>
                                );

                            return (
                                <div className={accordionClass}>
                                    <div className={className}>
                                        {title}
                                        <button onClick={self.onOpenBlock(methodName)} className="btn btn-empty ">
                                            <span style={{cursor: "pointer"}} className={chevronClass}/>
                                        </button>
                                        {removeButton}
                                    </div>
                                    {content}
                                </div>
                            )
                        }).concat([
                            <div className="accordion-container-dark">
                                <div className='title' onClick={self.addMethod}>
                                    <span>ADD NEW METHOD</span>
                                </div>
                            </div>
                        ])
                    }
                </div>
                <CodePreview/>
            </div>
        )
    }
});


function mapStateToProps(state) {
    return {
        schema: state.visualizationCreatorSchema.schema
    };
}


module.exports = connect(mapStateToProps)(Code);
