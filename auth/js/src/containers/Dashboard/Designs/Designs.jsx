'use strict';

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var DesignList = require('./DesignList');
var FileUpload = require('../../FileUpload/LightBoxContainer');
var ConfirmModal = require('../../ConfirmModal/ConfirmModal');
var Content = React.createClass({

    getInitialState: function () {
        return {
            open: 0,
            fadeIn: false,
            addingCard: false,
            title: "",
            description: "",
            id: "",
            confirmRemoveID:""
        }
    },

    onHideFileUpload: function () {
        this.setState({showFileUpload: false})
    },

    onShowFileUpload: function () {
        this.setState({showFileUpload: true})
    },


    onDownload: function (id) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.SESSION_DOWNLOAD, id: id});
        }
    },

    parseFormat: function (time) {
        var timestamp = parseFloat(time);
        var date = new Date(timestamp);
        return date.toLocaleString();
    },

    onOpenAdd: function () {
        var date = new Date();
        this.setState({addingCard: true, title: "", description: "", id: date.getTime()})
    },

    onOpenEdit: function (index) {
        var self = this;
        return function () {
            self.setState({
                addingCard: true,
                title: self.props.sessions[index].title,
                description: self.props.sessions[index].description,
                id: self.props.sessions[index].id
            })
        }
    },

    onCloseAdd: function () {
        this.setState({addingCard: false})
    },

    onAdd: function () {
        this.props.dispatch({
            type: ActionTypes.SESSION_ADD,
            id: this.state.id,
            title: this.state.title,
            description: this.state.description
        });
        this.setState({addingCard: false})
    },

    onChangeText: function (property) {
        var self = this;
        return function (event) {
            self.setState({[property]: event.target.value});
        }
    },

    onLoadSession: function (id) {
        var self = this;
        return function () {
            self.setState({fadeIn: false});
            setTimeout(function () {
                self.props.dispatch({type: ActionTypes.SESSION_LOAD, id: id});
            }, 200);
        }
    },

    onCloseSession: function (id) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.SESSION_UNLOAD, id: id})
        }
    },

    onShowDashboard: function () {
        var self = this;
        this.setState({fadeIn: false});
        setTimeout(function () {
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "Home"})
        }, 200);
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.setState({fadeIn: true})
        }, 10);
    },

    onRemove: function () {
        this.props.dispatch({type: ActionTypes.SESSION_REMOVE, id: this.state.confirmRemoveID});
        this.setState({confirmRemoveID: "", showRemoveConfirmation: false});
    },

    onOpenRemove: function (id) {
        var self = this;
        return function () {
            self.setState({confirmRemoveID: id, showRemoveConfirmation: true});
        }
    },

    onCloseRemove: function () {
        this.setState({confirmRemoveID: "", showRemoveConfirmation: false});
    },


    render: function () {
        var self = this;


        //TODO: Add animation
        var removeConfirmation;
        if (this.state.showRemoveConfirmation) {
            var removableSession = this.props.sessions.filter(function (session) {
                return session.id === self.state.confirmRemoveID;
            })[0];
            removeConfirmation = (
                <ConfirmModal
                    onClose={this.onCloseRemove}
                    onConfirm={this.onRemove}
                    description={'Application "' + removableSession.title + '", will be permanently removed.'}
                    title={'Remove'}
                />
            );
        }

        var removeAllButton;
        if (this.props.sessions.length > 1) {
            removeAllButton = (
                <button type="button" className="btn btn-sm btn-outline-dark mr-2">
                    <i className="fa fa-trash mr-1"/>
                    Remove all
                </button>
            );
        }

        var content;
        if (!this.state.addingCard)
            content = <DesignList designs={this.props.sessions}
                                  onOpenEdit={this.onOpenEdit}
                                  onDownload={this.onDownload}
                                  onLoadSession={this.onLoadSession}
                                  onCloseSession={this.onCloseSession}
                                  onOpenRemove={this.onOpenRemove}
                                  currentSessionID={this.props.currentSessionID}
            />;
        else
            content = (
                <div className="col-12 d-flex pb-3">
                    <div className="card bg-light flex-grow-1" style={{width: "100%"}}>
                        <div className="card-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" className="form-control" placeholder="Enter title"
                                       value={this.state.title}
                                       onChange={this.onChangeText("title")}/>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-control" placeholder="Enter description" rows="3"
                                          value={this.state.description}
                                          onChange={this.onChangeText("description")}/>
                            </div>
                        </div>
                        <div className="card-footer d-flex justify-content-end align-items-center">
                            <button className="btn btn-outline-danger btn-sm mr-2" onClick={this.onCloseAdd}>
                                <i className="fa fa-times-circle mr-1"/>
                                <span>Close</span>
                            </button>
                            <button className="btn btn-outline-success btn-sm mr-2" onClick={this.onAdd}>
                                <i className="fa fa-save mr-1"/>
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                </div>
            );


        var fileUpload;

        if (this.state.showFileUpload)
            fileUpload = <FileUpload onClose={this.onHideFileUpload} path={'./auth/uploadSession'}/>;

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";
        return (
            <div className={"container-fluid pt-5 d-flex justify-content-center home-page " + fadeClass}>
                {fileUpload}
                {removeConfirmation}
                <div className="home-page-container">
                    <div className="row mb-4 d-flex align-items-center">
                        <button type="button" className="btn btn-dark mr-2"
                                onClick={this.onShowDashboard}>
                            <i className="fa fa-chevron-left"/>
                        </button>
                        <h2 className="mb-0">
                            Applications
                        </h2>
                    </div>
                    <div className="row mb-4">
                        <div className="col-12 pb-3">
                            <div className="container-fluid h-100 h-100 d-flex flex-column">
                                <div className="row d-flex justify-content-end mb-2">
                                    <div className="d-flex align-items-center">
                                        <button type="button" className="btn btn-sm btn-outline-dark mr-2"
                                                onClick={this.onShowFileUpload}>
                                            <i className="fa fa-upload mr-1"/>
                                            Upload application
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-dark mr-2"
                                                onClick={this.onOpenAdd}>
                                            <i className="fa fa-plus mr-1"/>
                                            Create new application
                                        </button>
                                    </div>
                                </div>
                                <div className="row home-card pt-3 flex-grow-1">
                                    {content}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

function mapStateToProps(state) {
    return {
        sessions: state.ui.sessions,
        currentSessionID: state.ui.currentSessionID
    };
}


module.exports = connect(mapStateToProps)(Content);
