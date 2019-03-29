"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var MainNavigationBar = require('./NavigationBar/MainNavigationBar');
var MainContent = require('./MainContent/MainContent');
var ActionTypes = require('../actions/ActionTypes');
var fs = require('file-saver');
var FullScreenLoading = require('./FullScreenLoading/FullScreenLoading');
var SuccessMessage = require('./SuccessMessage/SuccessMessage');
var WorkingMessage = require('./WorkingMessage/WorkingMessage');
var ErrorBanner = require('./ErrorBanner/ErrorBanner');
var VisualOptions = require('../model/BuiltInVisualizations');

_.contains = _.includes;

var MainApp = React.createClass({

    onSaveWorkspace: function () {
        var workspace = Object.assign({}, this.context.store.getState());
        delete workspace.socket;
        var file = new Blob([JSON.stringify(workspace)], {type: 'application/json'});
        fs.saveAs(file, "workspace.json");
    },


    connect: function () {
        this.props.dispatch({type: ActionTypes.OPEN_CONNECTION});
        this.props.dispatch({type: ActionTypes.LOAD_SESSION});
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.connect();
        }, 1000);

        window.onbeforeunload = function () {
            return "";
        };
        window.addEventListener('beforeunload', function () {
            return "";
        });
    },

    render: function () {
        var content = <FullScreenLoading/>;
        if (!this.props.loading) {
            content = (
                <div id="main-app">
                    <a id="downloader"/>
                    <MainNavigationBar/>
                    <WorkingMessage/>
                    <SuccessMessage/>
                    <ErrorBanner/>
                    <MainContent/>
                </div>
            );
        }
        return content;
    }
});

MainApp.contextTypes = {
    store: React.PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        loading: state.ui.loading
    };
}

module.exports = connect(mapStateToProps)(MainApp);