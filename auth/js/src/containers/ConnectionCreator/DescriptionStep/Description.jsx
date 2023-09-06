"use strict";

var React = require('react');
var CardPreview = require('./CardPreview');
var StructElem = require('./StructureElem');
var StructureContainer = require('./StructureContainer');
var structTypes = require('../../../constants/ConnectionStructTypes').types;
var structTypesLabels = require('../../../constants/ConnectionStructTypes').types_label;
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var iconsList = require('./iconsList');
var Description = React.createClass({

    getInitialState: function () {
        return {
            iconsTab: Object.keys(iconsList)[0],
            open: 0,
            showEditLB: false,
            editingID: "none",
            title: "",
            type: structTypes.OBJECT,
            desc: ""
        }
    },

    onOpenEditProperty: function (id) {
        var self = this;
        return function () {
            self.setState({showEditLB: true, editingID: id})
        }
    },

    onAddChildren: function (id) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: ActionTypes.STRUCTURE_ADD_CHILD,
                id: id,
                title: Math.random().toString(30).substring(3)
            });
        }
    },

    onRemoveElem: function (id) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: ActionTypes.STRUCTURE_REMOVE_ELEM,
                id: id
            });
        }
    },


    onSaveChildren: function () {
        let data = {
            title: this.state.title,
            type: this.state.type,
            desc: this.state.desc,
            color: this.state.color
        };
        if (this.state.type !== structTypes.OBJECT)
            data.children = [];

        this.props.dispatch({
            type: ActionTypes.STRUCTURE_CHANGE_NODE,
            id: this.state.editingID,
            data: data
        });

        this.setState({showEditLB: false, editingID: ""})
    },

    onChangeStructValue: function (property) {
        var self = this;
        return function (e) {
            self.setState({[property]: e.target.value})

        }
    },

    onCloseEditProperty: function () {
        this.setState({showEditLB: false})
    },

    onOpenLeftBlock: function (index) {
        var self = this;
        return function () {
            if (self.state.open === index) self.setState({open: "none"});
            else self.setState({open: index});
        }
    },

    _changeTab: function (tabName) {
        var self = this;
        return function () {
            self.setState({iconsTab: tabName})
        }
    },

    onUpdateField: function (fieldName) {
        var self = this;
        return function (event) {
            self.props.dispatch({
                type: ActionTypes.UPDATE_FIELD_CONN,
                fieldName: fieldName,
                value: event.target.value
            });
        }
    },

    onUpdateIcon: function (iconObj) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: ActionTypes.UPDATE_FIELD_CONN,
                fieldName: "icon",
                value: iconObj.name
            });
            self.props.dispatch({
                type: ActionTypes.UPDATE_FIELD_CONN,
                fieldName: "iconUnicode",
                value: iconObj.unicode
            });
        }
    },

    render: function () {
        var self = this;

        var descriptionContent = (
            <div className="p-3 flex-grow-1 mh-0" style={{overflow: "auto"}}>
                <div className="row mb-3">
                    <div className="col-5">
                        <label className="font-weight-bold">Connection name</label>
                        <input className="form-control" onChange={this.onUpdateField("name")}
                               defaultValue={this.props.name}/>
                        <small>Connection name</small>
                    </div>
                    <div className="col-5">
                        <label className="font-weight-bold">Property name</label>
                        <input className="form-control" onChange={this.onUpdateField("property")}
                               defaultValue={this.props.property}/>
                        <small>Property name to be copied through the connection</small>
                    </div>
                    <div className="col-2">
                        <label className="font-weight-bold">Color</label>
                        <input type="color" className="form-control" onChange={this.onUpdateField("color")}
                               defaultValue={this.props.color}/>
                        <small>Connection color</small>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 d-flex flex-column">
                        <label className="font-weight-bold">Icon</label>
                        <small>Pictogram to represent the connection</small>
                        <div className="card flex-grow-1 d-flex flex-column">
                            <div className="card-header">
                                <ul className="nav nav-pills">
                                    {
                                        Object.keys(iconsList).map(function (listName) {
                                            var tabClass = listName === self.state.iconsTab ?
                                                "nav-link active bg-dark" : "nav-link text-dark";
                                            return (
                                                <li className="nav-item">
                                                    <a className={tabClass} href="#"
                                                       onClick={self._changeTab(listName)}>{listName}</a>
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                            <div className="card-body flex-grow-1">
                                {
                                    iconsList[self.state.iconsTab].map(function (iconObj) {
                                        var buttonClass = iconObj.name === self.props.icon ?
                                            "btn btn-outline-primary m-2 p-2 active" : "btn btn-outline-primary m-2 p-2";
                                        return (
                                            <button type="button" className={buttonClass}
                                                    onClick={self.onUpdateIcon(iconObj)}>
                                                <i className={iconObj.name + " fa-lg fa-fw"}/>
                                            </button>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

        var editLB;
        if (this.state.showEditLB) {
            var editingNode = this.props.structure[this.state.editingID];
            editLB = (
                <div className="property-lb">
                    <div className="modal-content" style={{width: "90%"}}>
                        <div className="modal-header">
                            <h5 className="modal-title"><span>Edit property</span>
                            </h5>
                            <button type="button" className="close" onClick={this.onCloseEditProperty}>
                                <span>×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="pb-2">
                                <label className="font-weight-bold">Title</label>
                                <input type="text" className="form-control" defaultValue={editingNode.title}
                                       onChange={this.onChangeStructValue('title')}/>
                            </div>
                            <div className="pb-2">
                                <label className="font-weight-bold">Type</label>
                                <select className="custom-select"
                                        onChange={this.onChangeStructValue('type')}
                                        defaultValue={editingNode.type}>
                                    {
                                        Object.keys(structTypesLabels).map(function (type) {
                                            return <option value={structTypes[type]}>{structTypesLabels[type]}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <label className="font-weight-bold">Description</label>
                                <textarea className="form-control"
                                          onChange={this.onChangeStructValue('desc')}
                                          defaultValue={editingNode.desc}/>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary"
                                    onClick={this.onCloseEditProperty}>Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={this.onSaveChildren}>Save
                                changes
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        var propertySContent = (
            <div className="p-3 flex-grow-1 mh-0" style={{overflow: "auto"}}>
                <div className="mb-3">
                    <div className="list-tree">
                        <ul>
                            <StructureContainer root={true}
                                                tree={this.props.structure}
                                                id={0}
                                                onAddChildren={this.onAddChildren}
                                                onOpenEditProperty={this.onOpenEditProperty}
                                                onRemoveElem={this.onRemoveElem}/>
                        </ul>
                    </div>
                </div>
                {editLB}
            </div>
        );

        var leftComponents = [{title: "Description", component: descriptionContent, icon: "fa fa-book"},
            {title: "Property structure", component: propertySContent, icon: "fa fa-align-left"}];

        return (
            <div className="container-content row wrap-cols flex-grow mh-0">
                <div className="col-6 pr-2 accordion-wrapper h-100 p-3">
                    {
                        leftComponents.map(function (obj, i) {
                            var containerClass = "accordion-container";
                            var titleClass = "title";
                            var content;
                            var cevhronClass = "fa fa-plus";
                            if (self.state.open === i) {
                                containerClass = "accordion-container full flex-grow mh-0";
                                titleClass = "title open";
                                content = obj.component;
                                cevhronClass = "fa fa-minus";
                            }

                            return (
                                <div
                                    className={containerClass}>
                                    <div className={titleClass}>
                                        <h6><i className={"mr-2 fa-fw " + obj.icon}/>{obj.title}</h6>
                                        <button onClick={self.onOpenLeftBlock(i)} className="btn btn-empty">
                                            <span style={{cursor: "pointer"}} className={cevhronClass}/>
                                        </button>
                                    </div>
                                    {content}
                                </div>
                            )
                        })
                    }
                </div>
                <CardPreview/>
            </div>)
    }
});


function mapStateToProps(state) {
    return state.connectionCreatorSchema
}


module.exports = connect(mapStateToProps)(Description);
