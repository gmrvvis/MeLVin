'use strict';

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');

var LayerOptions = React.createClass({

    getInitialState() {
        return {open: -1, showConnectionMenu: false}
    },

    onAddCard: function () {
        this.props.dispatch({type: ActionTypes.ADD_LAYER, id: this.props.layers.lastID, title: "New", color: "#000000"})
    },

    onOpen: function (index) {
        var self = this;
        return function () {
            self.setState({open: index})
        }
    },

    onRemove: function (layerID) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.REMOVE_LAYER, id: layerID})
        }
    },

    onClose: function (index) {
        this.setState({open: -1})
    },

    onColorChange: function (id) {
        var self = this;
        return function (event) {
            self.props.dispatch({
                type: ActionTypes.SET_LAYER_PROP,
                id: id,
                property: "color",
                value: event.target.value
            });
        }
    },

    onChangeText: function (id) {
        var self = this;
        return function (event) {
            self.props.dispatch({
                type: ActionTypes.SET_LAYER_PROP,
                id: id,
                property: "title",
                value: event.target.value
            });
        }
    },

    render: function () {
        var self = this;
        return (
            <div className="row">
                <div className="col accordion">
                    {
                        this.props.layers.allIds.map(function (layerID, i) {
                            var layer = self.props.layers.byId[layerID];

                            if (i === self.state.open) {
                                return (
                                    <div className="card bg-light">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <span className="colorCircle mr-2"
                                                      style={{backgroundColor: layer.color}}/>
                                                <span>{layer.title}</span>
                                            </div>
                                            <button type="button" className="btn btn-light btn-empty btn-sm" onClick={self.onClose}>
                                                <i className="fa fa-minus"/>
                                            </button>
                                        </div>
                                        <div className="card-body bg-white">
                                            <div className="row mb-3">
                                                <div className="col-6 pr-2">
                                                    <label className="font-weight-bold">Title</label>
                                                    <input type="text" className="form-control" value={layer.title}
                                                           onChange={self.onChangeText(layer.id)}/>
                                                </div>
                                                <div className="col-6 pl-2">
                                                    <label className="font-weight-bold">Color</label>
                                                    <div className="input-group">
                                                        <input type="color" onChange={self.onColorChange(layer.id)}
                                                               style={{height: "38px"}} defaultValue={layer.color}
                                                               className="form-control"/>
                                                        <div className="input-group-append">
                                                            <span className="input-group-text">{layer.color}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row mb-3 d-flex align-items-center">
                                                <div className="col-12">
                                                    <label className="font-weight-bold">Opacity</label>
                                                </div>
                                                <div className="col-9">
                                                    <input type="range" className="custom-range" min="0" max="1" step="0.05" defaultValue="0"/>
                                                    <div className="d-flex justify-content-between">
                                                        <small>0</small>
                                                        <small>0.5</small>
                                                        <small>1</small>
                                                    </div>
                                                </div>
                                                <div className="pl-0 col-3">
                                                    <input type="text" className="form-control" value={0} disabled/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            else {
                                return (
                                    <div className="card bg-light">
                                        <div
                                            className="card-header d-flex justify-content-between align-items-center border-bottom-0">
                                            <div className="d-flex align-items-center">
                                                <span className="colorCircle mr-2"
                                                      style={{backgroundColor: layer.color}}/>
                                                <span>{layer.title}</span>
                                            </div>
                                            <div>
                                                <button type="button" className="btn btn-light btn-empty btn-sm mr-2"
                                                        onClick={self.onRemove(layerID)}>
                                                    <i className="fa fa-trash"/>
                                                </button>
                                            <button type="button" className="btn btn-light btn-empty btn-sm"
                                                    onClick={self.onOpen(i)}>
                                                <i className="fa fa-plus"/>
                                            </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    }
                    <div className="card bg-light" onClick={this.onAddCard} style={{cursor: "pointer"}}>
                        <div className="card-header d-flex justify-content-center align-items-center">
                            <i className="fa fa-plus"/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});


function mapStateToProps(state) {
    return {
        layers: state.layers
    };
}

module.exports = connect(mapStateToProps)(LayerOptions);
