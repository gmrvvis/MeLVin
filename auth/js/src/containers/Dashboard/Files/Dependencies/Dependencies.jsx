"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../../actions/ActionTypes');
var Dependency = require('./DependencieItem');
var LightBoxFileUpload = require('../../../FileUpload/LightBoxContainer');
var ContentContainer = require('../../ContentContainer');

var VizListModal = React.createClass({


    getInitialState: function () {
        return {fadeIn: false}
    },

    onHideFileUpload: function () {
        this.setState({showFileUpload: false})
    },

    onShowFileUpload: function () {
        this.setState({showFileUpload: true})
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

    onRemoveAllFiles: function () {
        this.props.dispatch({type: ActionTypes.REMOVE_ALL_DEPENDENCIES});
    },

    render: function () {
        var dependenciesList = Object.values(this.props.dependenciesFiles);

        var buttons = [{action: this.onShowFileUpload, text: 'Upload file', iconClass: 'fa fa-upload'}];

        if (dependenciesList.length > 1) {
            buttons.push({action: this.onRemoveAllFiles, text: 'Remove all', iconClass: 'fa fa-trash'});
        }

        var dependencies = (<div className="d-flex h-100 w-100 justify-content-center align-items-center">
            <h3>No dependency loaded</h3>
        </div>);

        if (dependenciesList.length> 0) {
            dependencies = dependenciesList.map(function (dependency) {
                return <Dependency dependency={dependency}/>
            })
        }

        var fileUpload;
        if (this.state.showFileUpload)
            fileUpload = <LightBoxFileUpload onClose={this.onHideFileUpload} path={'./auth/uploadLib'}/>;

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";

        return (
            <ContentContainer fadeClass={fadeClass}
                              fileUpload={fileUpload}
                              buttons={buttons}
                              cards={dependencies}
                              title={'Files'}
                              subtitle={'Dependencies'}
                              onShowDashboard={this.onShowDashboard}/>
        )
    }
});

function mapStateToProps(state) {
    return {
        dependenciesFiles: state.ui.libFiles
    };
}


module.exports = connect(mapStateToProps)(VizListModal);
