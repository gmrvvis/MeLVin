'use strict';

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var CardBuilderActionTypes = require('../../actions/CardBuilderActionTypes');
var ConfirmModal = require('../ConfirmModal/ConfirmModal');

var Content = React.createClass({

    getInitialState: function () {
        return {fadeIn: false}
    },

    parseFormat: function (time) {
        var timestamp = parseFloat(time);
        var parsedTimestamp = new Date(timestamp);
        var hour = parsedTimestamp.toLocaleString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
        var date = parsedTimestamp.toLocaleString('en-US', {month: 'long'}) + ' ' + parsedTimestamp.getDate() + ', ' + parsedTimestamp.getFullYear();
        return hour + " " + date;
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

    onShowVisualizations: function () {
        var self = this;
        this.fadeOut(function () {
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "VisualizationList"})
        });

    },

    onShowProcessing: function () {
        var self = this;
        this.fadeOut(function () {
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ProcessingList"})
        });
    },

    onShowConnections: function () {
        this.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ConnectionList"})
    },

    onShowDataFiles: function () {
        this.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "FilesList"})
    },

    onShowDependencies: function () {
        this.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "DependenciesList"})
    },

    onShowThumbnails: function () {
        this.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ThumbnailsList"})
    },

    onShowAllDesigns: function () {
        this.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "Designs"})
    },

    openVisualizationCreator: function () {
        var self = this;
        this.fadeOut(function () {
            self.props.dispatch({type: ActionTypes.CLEAR_CREATOR});
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "VisualizationCreator"})
        });
    },

    openCardCreator: function () {
        var self = this;
        this.fadeOut(function () {
            self.props.dispatch({type: CardBuilderActionTypes.CLEAR_CREATOR});
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ProcessingCreator"})
        });
    },

    openConnectionCreator: function () {
        var self = this;
        this.fadeOut(function () {
            self.props.dispatch({type: ActionTypes.CLEAR_CONN_CREATOR});
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ConnectionCreator"})
        });
    },

    fadeOut: function (callback) {
        this.setState({fadeIn: false});
        setTimeout(function () {
            callback()
        }, 200);
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.setState({fadeIn: true})
        }, 10);
    },

    render: function () {
        var self = this;

        var cards;
        if (!this.state.addingCard && this.props.sessions && this.props.sessions.length > 0) {
            cards = [];
            var length = Math.min(4, this.props.sessions.length);
            for (var i = 0; i < length; i++) {
                var session = this.props.sessions[i];
                var paddingClass = i % 2 ? " pl-2" : " pr-2";
                var cardBodyColor = " bg-light text-dark";
                var btnOpen = (
                    <button key={session.id + "_close"} className="btn btn-light btn-sm"
                            onClick={self.onCloseSession(session.id)}><i
                        className="fa fa-times-circle fa-fw mr-2"/>
                        Close
                    </button>
                );
                if (session.id !== this.props.currentSessionID) {
                    btnOpen = (
                        <button key={session.id + "_open"} className="btn btn-light btn-sm"
                                onClick={self.onLoadSession(session.id)}><i
                            className="fa fa-folder-open fa-fw mr-2"/>
                            Open
                        </button>
                    );

                    cardBodyColor = "";
                }

                cards.push(
                    <div key={session.id} className={"col-6 d-flex pb-3" + paddingClass}>
                        <div className="card flex-grow-1 text-white bg-dark"
                             style={{width: "100%"}}>
                            <div className={"card-body rounded" + cardBodyColor}>
                                <h5 className="card-title">{session.title}</h5>
                                <p className="card-text">{session.description}</p>
                            </div>
                            <div
                                className="card-footer d-flex justify-content-between align-items-center">
                                <span>{self.parseFormat(session.lastModified)}</span>
                                <div>
                                    {btnOpen}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        }
        else {
            cards = (
                <div className="col-12 d-flex align-items-center justify-content-center">
                    <div className="d-flex flex-column">
                        <h3>No applications available</h3>
                        <button className="btn btn-outline-dark btn-sm mr-2" onClick={this.onOpenAdd}>
                            <i className="fa fa-plus mr-1"/>
                            <span>Create my first application</span>
                        </button>
                    </div>
                </div>
            )
        }

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";
        return (
            <div className={"container-fluid pt-5 d-flex justify-content-center home-page " + fadeClass}>
                <div className="home-page-container">
                    <div className="row mb-4 d-flex justify-content-between align-content-center">
                        <h2 className="mb-0">
                            Dashboard
                        </h2>
                        <div className="d-flex align-items-center">
                            <span className="mr-3">{"Welcome back, " + this.props.username + "!"}</span>
                            <button type="button" className="btn btn-sm btn-outline-dark" disabled>
                                <i className="fa fa-user-cog mr-2"/>
                                Account
                            </button>
                        </div>
                    </div>
                    <div className="row mb-4">
                        <div className="col-12 col-xl-6 pb-3">
                            <div className="container-fluid h-100 h-100 d-flex flex-column">
                                <div className="row d-flex justify-content-between mb-2">
                                    <h3 className="mb-0 mt-0">
                                        <small className="text-muted">Applications</small>
                                    </h3>
                                    <button type="button" className="btn btn-sm btn-outline-dark"
                                            onClick={this.onShowAllDesigns}>
                                        <i className="fa fa-th-large mr-1"/>
                                        More
                                    </button>
                                </div>
                                <div className="row home-card pt-3 flex-grow-1">
                                    {cards}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-xl-6 pb-3">
                            <div className="container-fluid h-100 h-100 d-flex flex-column">
                                <div className="row d-flex justify-content-between mb-2">
                                    <h3 className="mb-0 mt-0">
                                        <small className="text-muted">Custom components</small>
                                    </h3>
                                </div>
                                <div className="row home-card pt-3 pb-3 mb-3 flex-grow-1">
                                    <div className="col-4 d-flex pr-2">
                                        <div className="card bg-light flex-grow-1" style={{width: "100%"}}>
                                            <div className="card-body text-center">
                                                <img className="thumbnail-image-fit"
                                                     src="./auth/assets/images/visualizationIcon.svg"/>
                                                <h5 className="card-title mb-0">Visualization cards</h5>
                                            </div>
                                            <div
                                                className="card-footer d-flex justify-content-center align-items-center">
                                                <button className="btn btn-outline-dark btn-sm mr-2"
                                                        onClick={this.openVisualizationCreator}>
                                                    <i className="fa fa-plus mr-2"/>
                                                    Create
                                                </button>
                                                <button className="btn btn-outline-dark btn-sm"
                                                        onClick={this.onShowVisualizations}>
                                                    <i className="fa fa-th-large mr-2"/>
                                                    More
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-4 d-flex pl-2 pr-2">
                                        <div className="card bg-light flex-grow-1" style={{width: "100%"}}>
                                            <div className="card-body text-center">
                                                <img className="thumbnail-image-fit"
                                                     src="./auth/assets/images/processingIcon.svg"/>
                                                <h5 className="card-title mb-0">Processing cards</h5>
                                            </div>
                                            <div
                                                className="card-footer d-flex justify-content-center align-items-center">
                                                <button className="btn btn-outline-dark btn-sm mr-2"
                                                        onClick={this.openCardCreator}>
                                                    <i className="fa fa-plus mr-2"/>
                                                    Create
                                                </button>
                                                <button className="btn btn-outline-dark btn-sm"
                                                        onClick={this.onShowProcessing}>
                                                    <i className="fa fa-th-large mr-2"/>
                                                    More
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-4 d-flex pl-2">
                                        <div className="card bg-light flex-grow-1" style={{width: "100%"}}>
                                            <div className="card-body text-center">
                                                <img className="thumbnail-image-fit"
                                                     src="./auth/assets/images/connectionIcon.svg"/>
                                                <h5 className="card-title mb-0">Connections</h5>
                                            </div>
                                            <div
                                                className="card-footer d-flex justify-content-center align-items-center">
                                                <button className="btn btn-outline-dark btn-sm mr-2"
                                                        onClick={this.openConnectionCreator}>
                                                    <i className="fa fa-plus mr-2"/>
                                                    Create
                                                </button>
                                                <button className="btn btn-outline-dark btn-sm"
                                                        onClick={this.onShowConnections}>
                                                    <i className="fa fa-th-large mr-2"/>
                                                    More
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row d-flex justify-content-between mb-2">
                                    <h3 className="mb-0 mt-0">
                                        <small className="text-muted">Files</small>
                                    </h3>
                                </div>
                                <div className="row home-card pt-3 pb-3 flex-grow-1">
                                    <div className="col-4 d-flex pr-2">
                                        <div className="card bg-light flex-grow-1" style={{width: "100%"}}>
                                            <div className="card-body text-center">
                                                <img className="thumbnail-image-fit"
                                                     src="./auth/assets/images/dataIcon.svg"/>
                                                <div className="flex-grow-1">
                                                    <h5 className="card-title mb-0">Data files</h5>
                                                </div>
                                            </div>
                                            <div
                                                className="card-footer d-flex justify-content-center align-items-center">
                                                <button className="btn btn-outline-dark btn-sm"
                                                        onClick={this.onShowDataFiles}>
                                                    <i className="fa fa-th-large mr-2"/>
                                                    More
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-4 d-flex pl-2 pr-2">
                                        <div className="card bg-light flex-grow-1" style={{width: "100%"}}>
                                            <div className="card-body text-center">
                                                <img className="thumbnail-image-fit"
                                                     src="./auth/assets/images/dependencieIcon.svg"/>
                                                <h5 className="card-title mb-0">Dependencies</h5>
                                            </div>
                                            <div
                                                className="card-footer d-flex justify-content-center align-items-center">
                                                <button className="btn btn-outline-dark btn-sm"
                                                        onClick={this.onShowDependencies}>
                                                    <i className="fa fa-th-large mr-2"/>
                                                    More
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-4 d-flex pl-2">
                                        <div className="card bg-light flex-grow-1" style={{width: "100%"}}>
                                            <div className="card-body text-center">
                                                <img className="thumbnail-image-fit"
                                                     src="./auth/assets/images/previewIcon.svg"/>
                                                <h5 className="card-title mb-0">Thumbnails</h5>
                                            </div>
                                            <div
                                                className="card-footer d-flex justify-content-center align-items-center">
                                                <button className="btn btn-outline-dark btn-sm"
                                                        onClick={this.onShowThumbnails}>
                                                    <i className="fa fa-th-large mr-2"/>
                                                    More
                                                </button>
                                            </div>
                                        </div>
                                    </div>

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
        username: state.ui.username,
        currentSessionID: state.ui.currentSessionID
    };
}

module.exports = connect(mapStateToProps)(Content);