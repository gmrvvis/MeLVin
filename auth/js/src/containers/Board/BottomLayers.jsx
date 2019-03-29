'use strict';

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var LayersMenu = require('./LayersSidebar/LayersSidebar');

var BottomLayers = React.createClass({

    getInitialState: function () {
        return {open: false}
    },

    openMenu: function () {
        this.setState({open: !this.state.open});
    },

    closeMenu: function () {
        this.setState({open: false});
    },

    onToggleLayer: function (id, value) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.SET_LAYER_PROP, id: id, property: "visibility", value: !value})
        }
    },

    onActivateLayer: function (id) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.ACTIVATE_LAYER, id: id})
        }
    },

    onToggleBrush: function () {
        this.props.dispatch({type: ActionTypes.TOGGLE_LAYER_BRUSH, activeBrush: !this.props.layers.activeBrush})
    },

    onOpenSettings: function () {
        this.props.dispatch({type: ActionTypes.OPEN_BLUEPRINT_SIDEBAR});
    },

    render: function () {
        var self = this;
        var brushClass = this.props.layers.activeBrush ? "layer-conf brush active mt-3" : "layer-conf brush mt-3";
        var activeLayer = this.props.layers.byId[this.props.layers.activeLayerId];
        var activeLayerColor = activeLayer ? activeLayer.color : "#000";
        var layers = (
            <div className="layer-empty-compartment">
                <span>No layers</span>
            </div>
        );

        if (this.props.layers.allIds.length > 0)
            layers = this.props.layers.allIds.map(function (layerID) {
                var layer = self.props.layers.byId[layerID];
                var icon = layer.visibility ? "far fa-eye" : "far fa-eye-slash fade-eye";
                var layerClass = self.props.layers.activeLayerId === layerID ? "layer-item" : "layer-item";
                return (
                    <div className={layerClass}>
                        <div className="layer-item-compartment color" onClick={self.onActivateLayer(layerID)}>
                            <div className="squareLayer" style={{
                                backgroundColor: layer.color
                            }}>
                            </div>
                        </div>
                        <div className="layer-item-compartment eye"
                             onClick={self.onToggleLayer(layerID, layer.visibility)}>
                            <i className={icon}/>
                        </div>
                    </div>
                )
            });

        var content;
        var closeBtn;
        if (this.state.open) {
            content = (
                <div className="floating-menu-right">
                    <LayersMenu/>
                </div>
            );

            closeBtn = (
                <div className="floating-close right" onClick={this.closeMenu}>
                    <i className="fa fa-times"/>
                </div>
            );

        }


        var layersClass = this.state.open ? "menu-icon active layer-conf" : "menu-icon layer-conf";

        return (
            <div className="floating-menu-wrapper-right">
                {closeBtn}
                <div className="layer-container">
                    <div className="bottomColor">
                        {layers}
                        <div className={layersClass} onClick={this.openMenu}>
                            <i className="fa fa-cog"/>
                            <span>Layers</span>
                        </div>
                    </div>

                    <div className={brushClass} onClick={this.onToggleBrush}>
                        <div>
                            <i className="fa fa-paint-roller"/>
                            <div style={{
                                height: "8px", width: "8px", backgroundColor: activeLayerColor, borderRadius: "50%",
                                alignSelf: "flex-end"
                            }}/>
                        </div>
                        <span>Paint</span>
                    </div>

                </div>
                {content}
            </div>
        )
    }
});


function mapStateToProps(state) {
    return {
        layers: state.layers
    };
}

module.exports = connect(mapStateToProps)(BottomLayers);
