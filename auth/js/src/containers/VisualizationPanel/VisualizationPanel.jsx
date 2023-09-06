'use strict';

var React = require('react');
var viewsPanel = require('../../model/ViewsPanel');
var connect = require("react-redux").connect;

var VisualizationPanel = React.createClass({

    getInitialState: function () {
        return {showOptions:{}}
    },

    onShowOptions: function(vizID){
        this.state.showOptions[vizID] = true;
        this.setState({showOptions: this.state.showOptions})
    },

    onHideOptions: function(vizID){
        this.state.showOptions[vizID] = false;
        this.setState({showOptions: this.state.showOptions})
    },

    componentWillUnmount: function () {
        viewsPanel.destroy();
    },

    componentDidMount: function () {
        var node = this.refs.panel;
        viewsPanel.init(node, this.props.selectedVizPanelID);
    },

    componentDidUpdate: function () {
        var node = this.refs.panel;
        viewsPanel.init(node, this.props.selectedVizPanelID);
    },

    render: function () {
        return (
            <div ref="panel">
            </div>
        );
    }
});


function mapStateToProps(state) {
    return {
        width: state.ui.width,
        height: state.ui.height
    };
}

module.exports = connect(mapStateToProps)(VisualizationPanel);