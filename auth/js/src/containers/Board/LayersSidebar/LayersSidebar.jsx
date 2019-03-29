'use strict';

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var ConnectionTypes = require('./../../../constants/ConnectionTypes');
var Layers = require('./LayerOptions');

var layersSidebar = React.createClass({


    getInitialState: function () {
        return {open: 0}
    },

    openTab: function (index) {
        var self = this;
        return function () {
            self.setState({open: index});
        }
    },

    onCheckChange: function (type) {
        var self = this;
        return function (event) {
            //TODO: review, error prone
            if (!event.currentTarget.childNodes[0].checked)
                self.props.dispatch({type: ActionTypes.ADD_HIDDEN_CONNECTION, connType: type});
            else
                self.props.dispatch({type: ActionTypes.REMOVE_HIDDEN_CONNECTION, connType: type})
        }
    },

    onSliderChange: function (event) {
        this.props.dispatch({type: ActionTypes.ALPHA_HIDDEN_CONNECTION, alpha: parseFloat(event.target.value)});
    },

    onCloseSidebar: function(){
        this.props.dispatch({type: ActionTypes.CLOSE_BLUEPRINT_SIDEBAR});
    },

    render: function () {

        var self = this;
        var sidebarClass = "col-3 sidebar-right";
        if (this.props.blueprintSideBarOpen && !this.props.cardBeingDragged) sidebarClass += " open-right";

        var tabs = ["Connection types", "Layers"];

        var tabContent;

        if (this.state.open === 0) {
            tabContent = (
                <div className="container tab-content scroll-y pt-3">
                    <div className="form-group mb-3">
                        <div>
                            <label className="col-form-label pb-0 pt-1 font-weight-bold">Hidden connection types</label>
                        </div>
                        <small>Checked connection types will be hidden</small>
                        <hr className="mt-1 mb-2"/>
                        {
                            ConnectionTypes.types.map(function (connType) {
                                var checked = self.props.hiddenConnections.indexOf(connType) !== -1;
                                return (
                                    <div className="custom-control custom-checkbox ml-2"
                                         onClick={self.onCheckChange(connType)}>
                                        <input type="checkbox" className="custom-control-input" checked={checked}/>
                                        <label className="custom-control-label">
                                            {ConnectionTypes.labels[connType]}
                                        </label>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div>
                        <label className="pb-0 pt-1 font-weight-bold">Transparency level</label>
                    </div>
                    <small>Establishes the transparency level for the above selected connection types</small>
                    <hr className="mt-1 mb-2"/>
                    <div className="row pl-2">
                        <div className="col-9">
                            <input type="range" className="custom-range" min="0" max="1" step="0.05" defaultValue="0"
                                   onChange={this.onSliderChange}/>
                            <div className="d-flex justify-content-between">
                                <small>0</small>
                                <small>0.5</small>
                                <small>1</small>
                            </div>
                        </div>
                        <div className="pl-0 col-3">
                            <input type="text" className="form-control" value={this.props.hiddenAlpha} disabled/>
                        </div>
                    </div>
                </div>
            )
        }
        else if (this.state.open === 1) {
            tabContent = (
                <div className="container tab-content scroll-y pt-3">
                    <Layers/>
                </div>
            )
        }

        return (
            <div className="d-flex flex-column" style={{height: "100%"}}>
                <div className="row-gray bottom-border-1">
                    <h4 className="text-center mb-4 mt-4">Layers</h4>
                </div>
                <div className="container tab-content scroll-y pt-3">
                    <Layers/>
                </div>
            </div>
        )
    }

});


function mapStateToProps(state) {
    return {
        cards: state.cards,
        connections: state.connections,
        selectedCard: state.ui.selectedCard,
        blueprintSideBarOpen: state.ui.blueprintSideBarOpen,
        cardBeingDragged: state.ui.cardBeingDragged,
        hiddenConnections: state.ui.hiddenConnections,
        hiddenAlpha: state.ui.hiddenAlpha
    };
}

module.exports = connect(mapStateToProps)(layersSidebar);
