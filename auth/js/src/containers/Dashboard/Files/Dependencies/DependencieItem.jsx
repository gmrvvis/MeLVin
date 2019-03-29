"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../../actions/ActionTypes');
var VizListModal = React.createClass({


    getInitialState: function () {
        return {
            fadeIn: false, editing: false, version: this.props.dependency.version,
            defaultID: this.props.dependency.defaultID, uniqueID: this.props.dependency.uniqueID,
            order: this.props.dependency.order
        }
    },

    openEdit: function () {
        this.setState({editing: true})
    },

    onChangeInput: function (property) {
        var self = this;
        return function (event) {
            self.setState({[property]: event.target.value});
        }
    },

    onSaveProperties: function () {
        this.props.dispatch({
            type: ActionTypes.EDIT_FILE_OPTION, fileName: this.props.dependency.filename, properties:
                {
                    version: this.state.version,
                    defaultID: this.state.defaultID,
                    uniqueID: this.state.uniqueID,
                    order: this.state.order
                }
        });
        this.setState({editing: false});
    },

    onClose: function () {
        this.setState({editing: false});
    },

    onRemove: function () {
        this.props.dispatch({type: ActionTypes.REMOVE_DEPENDENCY, name: this.props.dependency.filename});
    },

    downloadFile: function () {
        this.props.dispatch({type: ActionTypes.DOWNLOAD_FILE, path: './auth/libs/' + this.props.dependency.filename});
    },

    render: function () {

        var dependency = this.props.dependency;


        if (this.state.editing || !dependency.configured) {
            var closeButton;
            if (dependency.configured)
                closeButton = (
                    <button className="btn btn-outline-danger btn-sm mr-2" onClick={this.onClose}>
                        <i className="fa fa-times-circle mr-1"/>
                        <span>Close</span>
                    </button>
                );

            var info;
            if (!dependency.configured)
                info = (
                    <div className="w-100 pb-3 alert alert-warning">
                        <span>This dependency is not yet configured, please fill the following properties in order to enabled its usage.</span>
                    </div>
                );

            return (
                <div className='col-md-12 col-lg-6 col-xl-3 mb-3 mt-3'>
                    <div className="card bg-light h-100 d-flex flex-grow">
                        <div className="card-header text-center">
                            <h5 className="mb-0">{dependency.name}</h5>
                        </div>
                        <div
                            className="card-body p-3 flex-grow d-flex flex-column align-items-center justify-content-center">
                            {info}

                            <div className="w-100 pb-3">
                                <span>Version</span>
                                <input type="text" className="form-control" onChange={this.onChangeInput("version")}
                                       value={this.state.version}/>
                            </div>
                            <div className="w-100 pb-3">
                                <span>Default ID</span>
                                <input type="text" className="form-control" onChange={this.onChangeInput("defaultID")}
                                       value={this.state.defaultID}/>
                            </div>
                            <div className="w-100 pb-3">
                                <span>Unique ID</span>
                                <input type="text" className="form-control" onChange={this.onChangeInput("uniqueID")}
                                       value={this.state.uniqueID}/>
                            </div>
                            <div className="w-100">
                                <span>Load order</span>
                                <input type="text" className="form-control" onChange={this.onChangeInput("order")}
                                       value={this.state.order}/>
                            </div>
                        </div>
                        <div className="card-footer d-flex justify-content-end align-items-center">
                            {closeButton}
                            <button className="btn btn-outline-success btn-sm" onClick={this.onSaveProperties}>
                                <i className="fa fa-save mr-1"/>
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className='col-md-12 col-lg-6 col-xl-3 mb-3 mt-3'>
                    <div className="card bg-light h-100 d-flex flex-grow">
                        <div
                            className="card-body p-0 flex-grow d-flex align-items-center justify-content-center">
                            <div className="thumbnail m-bottom-0 border-0">
                                <img src={"./auth/assets/images/js.svg"}
                                     className="disable-events thumbnail-image" style={{height: "10vh"}}/>
                            </div>
                        </div>
                        <div className='card-footer' style={{borderTop: "1px solid #ddd"}}>
                            <div className="container-fluid">
                                <div className="row vertical-align">
                                    <div className="flex-grow title">
                                        <h6 className="m-0">{dependency.name}</h6>
                                    </div>
                                    <div>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={this.downloadFile}
                                        >
                                            <span className="fa fa-save"/>
                                        </button>
                                    </div>
                                    <div className="ml-1">
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={this.openEdit}
                                        >
                                            <span className="fa fa-pen"/>
                                        </button>
                                    </div>
                                    <div className="ml-1">
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={this.onRemove}
                                        >
                                            <span className="fa fa-trash"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
});


module.exports = connect()(VizListModal);
