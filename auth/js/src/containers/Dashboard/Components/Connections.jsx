"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ConnectionTypes = require('./../../../constants/ConnectionTypes');
var FileUpload = require('../../FileUpload/LightBoxContainer');
var ActionTypes = require('../../../actions/ActionTypes');
var vizParams = require('../../../constants/CardsSchema');
var ContentContainer = require('../ContentContainer');
var Card = require('../Card');

var ConnectionsList = React.createClass({

    getInitialState: function () {
        return {fadeIn: false, showFileUpload: false}
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

    editConnection: function (id) {
        var self = this;
        return function() {
            var schemaName = id;
            var basePath = './auth/connections/';
            var downalodURI = basePath + schemaName;

            $.getJSON(downalodURI, function (schema) {
                self.props.dispatch({type: ActionTypes.CONNECTION_EDIT, schema: schema});
                self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ConnectionCreator"});
            })
        }
    },

    onRemoveAllConnections: function () {
        this.props.dispatch({
            type: ActionTypes.REMOVE_CUSTOM_CONN,
            properties: ConnectionTypes.types.filter(function (type) {
                return ConnectionTypes.defaultTypes.indexOf(type) === -1
            })
        });
    },

    onRemoveConnection: function (property) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: ActionTypes.REMOVE_CUSTOM_CONN,
                properties: [property]
            });
        }
    },

    onDownloadConnections: function (ids) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: ActionTypes.CONNECTION_DOWNLOAD,
                ids: ids
            });
        }
    },

    onHideFileUpload: function () {
        this.setState({showFileUpload: false})
    },

    onShowFileUpload: function () {
        this.setState({showFileUpload: true})
    },


    fadeOut: function (callback) {
        this.setState({fadeIn: false});
        setTimeout(function () {
            callback()
        }, 200);
    },

    openConnCreator: function () {
        var self = this;
        this.fadeOut(function () {
            self.props.dispatch({type: ActionTypes.CLEAR_CONN_CREATOR});
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ConnectionCreator"})
        });
    },

    render: function () {
        var self = this;

        var buttons = [{action: this.onShowFileUpload, text: 'Upload connection', iconClass: 'fa fa-upload'},
            {action: this.openConnCreator, text: 'Create new connection', iconClass: 'fa fa-plus'}];

        var connections = (<div className="d-flex h-100 w-100 justify-content-center align-items-center">
            <h3>No connections loaded</h3>
        </div>);

        var nonDefaultConnNum = 0;

        if (ConnectionTypes.types.length > 0) {
            connections = ConnectionTypes.types.map(function (connType) {
                var defaultType = ConnectionTypes.defaultTypes.indexOf(connType) !== -1;
                var buttons = <div><span className="text-muted font-italic">default connection</span></div>;
                if (!defaultType) {
                    buttons = (
                        <div className="d-flex">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={self.onDownloadConnections([connType])}>
                                <span className="fa fa-save"/>
                            </button>
                            <button
                                className="btn btn-outline-secondary btn-sm ml-1 mr-1"
                                onClick={self.editConnection(connType)}>
                                <span className="fa fa-pen"/>
                            </button>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={self.onRemoveConnection(connType)}>
                                <span className="fa fa-trash"/>
                            </button>
                        </div>
                    );
                    nonDefaultConnNum++;
                }
                return (
                    <div className='col-md-12 col-lg-6 col-xl-3 mb-3 mt-3'>
                        <div className="card bg-light" style={{flexGrow: 1, display: "flex", flexFlow: "column"}}>
                            <div className='card-footer border-top-0'>
                                <div className="container-fluid">
                                    <div className="row vertical-align">
                                        <div className="flex-grow title">
                                            <h6 className="m-0"><i
                                                className={ConnectionTypes.iconsText[connType] + " mr-3"}/>{ConnectionTypes.labels_short[connType]}
                                            </h6>
                                        </div>
                                        {buttons}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }

        if (nonDefaultConnNum.length > 1) {
            buttons.push({action: self.onDownloadConnections(ConnectionTypes.types), text: 'Download all',
                iconClass: 'fa fa-save'});
            buttons.push({action: self.onRemoveAllConnections, text: 'Remove all', iconClass: 'fa fa-trash'});
        }

        var fileUpload = this.state.showFileUpload ?
            <FileUpload onClose={this.onHideFileUpload} path={'/auth/uploadConnection'}/> :
            <div/>;

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";
        return (
            <ContentContainer fadeClass={fadeClass}
                              fileUpload={fileUpload}
                              contract={true}
                              buttons={buttons}
                              cards={connections}
                              title={'Custom components'}
                              subtitle={'Connections'}
                              onShowDashboard={this.onShowDashboard}/>
        )
    }
});

function mapStateToProps(state) {
    return {
        customVizNames: Object.keys(vizParams.names)
    };
}


module.exports = connect(mapStateToProps)(ConnectionsList);
