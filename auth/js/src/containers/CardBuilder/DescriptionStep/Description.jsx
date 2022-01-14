"use strict";

var React = require('react');
var CardPreview = require('./CardPreview');
var connect = require("react-redux").connect;
var ConnectionTypes = require('./../../../constants/ConnectionTypes');
var ActionTypes = require('../../../actions/CardBuilderActionTypes');

var Description = React.createClass({

    shouldComponentUpdate: function () {
        return true;
    },

    addConnection: function (direction) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.VIZCREATOR_ADD_CONN, direction: direction})
        }
    },

    removeConnection: function (direction, index) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.VIZCREATOR_RM_CONN, direction: direction, index: index})
        }
    },

    modConnection: function (direction, index, fieldName, value) {
        this.props.dispatch({
            type: ActionTypes.VIZCREATOR_MOD_CONN,
            direction: direction,
            index: index,
            fieldName: fieldName,
            value: value
        })

    },

    onValueChange: function (direction, index, fieldName) {
        var self = this;
        return function (event) {
            self.modConnection(direction, index, fieldName, event.target.value);
        }
    },

    onOpenLeftBlock: function (index) {
        var self = this;
        return function () {
            if (self.props.config.open === index) self.props.onChangeStepProp({open: "none"});
            else self.props.onChangeStepProp({open: index})
        }
    },

    onUpdateField: function (fieldName, value) {
        var self = this;
        return function () {
            self.props.dispatch({
                type: ActionTypes.UPDATE_FIELD_VIZ,
                fieldName: fieldName,
                value: value
            });
        }
    },

    render: function () {
        var self = this;
        var supportedLanguages = {
            javascript: {type: "javascript", icon: "fab fa-js mr-2", label: "JavaScript"},
            r: {type: "r", icon: "fab fa-r-project mr-2", label: "R"},
            python: {type: "python", icon: "fab fa-python mr-2", label: "Python"}
        };

        var descriptionContent = (
            <div className="p-3 flex-grow-1" style={{overflow: "auto"}}>
                <div className="row mb-3">
                    <div className="col-4">
                        <label className="font-weight-bold">Title</label>
                        <input className="form-control" onChange={this.props.onUpdateField("title")}
                               defaultValue={this.props.schema.title}/>
                    </div>
                    <div className="col-4">
                        <label className="font-weight-bold">Class Name</label>
                        <input className="form-control" onChange={this.props.onUpdateField("className")}
                               defaultValue={this.props.schema.className}/>
                    </div>
                    <div className="col-4 d-flex flex-column">
                        <label className="font-weight-bold">Language</label>
                        <div className="btn-group">
                            <button type="button" className="btn btn-secondary dropdown-toggle w-100"
                                    data-toggle="dropdown">
                                <i className={supportedLanguages[this.props.schema.runOn].icon}/>
                                <span>{supportedLanguages[this.props.schema.runOn].label}</span>
                            </button>
                            <div className="dropdown-menu">
                                {
                                    Object.values(supportedLanguages).map(function (languageObj) {
                                        return (
                                            <a className="dropdown-item"
                                               onClick={self.onUpdateField("runOn", languageObj.type)}>
                                                <i className={languageObj.icon}/>
                                                <span>{languageObj.label}</span>
                                            </a>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label className="font-weight-bold">Description</label>
                        <textarea className="form-control"
                                  onChange={this.props.onUpdateField("description")}
                                  defaultValue={this.props.schema.description}/>
                    </div>
                </div>
            </div>
        )


        var connectionContent = (
            <div className="p-3 flex-grow-1 d-flex flex-column mh-0 overflow">
                <div className="card mb-3" style={{display: "block"}}>
                    <div className="card-header font-bold d-flex align-items-center">
                        <h4 className="pull-left flex-grow">Incoming connections</h4>
                        <div className="btn-group">
                            <button className="fa fa-plus btn btn-outline-primary btn-sm"
                                    onClick={this.addConnection("in")}/>
                        </div>
                    </div>
                    <table
                        className="table table-right mb-0">
                        <thead>
                        <tr className="text-center">
                            <th className="border-bottom-0 border-top-0" style={{width: "10%"}}>Type</th>
                            <th className="border-bottom-0 border-top-0" style={{width: "10%"}}>Number</th>
                            <th className="border-bottom-0 border-top-0" style={{width: "15%"}}>Name</th>
                            <th className="border-bottom-0 border-top-0" style={{width: "60%"}}>Description</th>
                            <th className="border-bottom-0 border-top-0" style={{width: "5%"}}>Remove</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.props.schema.inConnections.map(function (connection, i) {
                                var uniqueTrueButtonClass = connection.unique ? "active" : "";
                                var uniqueFalseButtonClass = connection.unique ? "" : "active";
                                return (
                                    <tr key={i}>
                                        <td>
                                            <div className="dropdown" style={{position: "static"}}>
                                                <button className="btn btn-secondary dropdown-toggle" type="button"
                                                        data-toggle="dropdown"
                                                        style={{
                                                            width: "100%",
                                                            textAlign: "left",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            flexDirection: "row",
                                                            justifyContent: "center"
                                                        }} disabled={connection.disabled}>
                                                        <span
                                                            className="fa mr-2">{ConnectionTypes.icons[connection.type]}</span>
                                                    {ConnectionTypes.labels_short[connection.type]}
                                                </button>
                                                <div className="dropdown-menu">
                                                    {
                                                        ConnectionTypes.types.map(function (connType) {
                                                            return <a className="dropdown-item"
                                                                      href="#" onClick={function () {
                                                                return self.modConnection('in', i, 'type', connType)
                                                            }}>
                                                                    <span
                                                                        className="fa">{ConnectionTypes.icons[connType]}</span>
                                                                {ConnectionTypes.labels_short[connType]}
                                                            </a>
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <button type="button"
                                                        className={"btn btn-secondary font-weight-bold " + uniqueTrueButtonClass}
                                                        onClick={function () {
                                                            return self.modConnection("in", i, 'unique', true)
                                                        }} disabled={connection.disabled}>1
                                                </button>
                                                <button type="button"
                                                        className={"btn btn-secondary " + uniqueFalseButtonClass}
                                                        onClick={function () {
                                                            return self.modConnection("in", i, 'unique', false)
                                                        }} disabled={connection.disabled}><i
                                                    className="fa fa-infinity"/></button>
                                            </div>
                                        </td>
                                        <td>
                                            <input className="form-control"
                                                   style={{marginRight: "10px"}}
                                                   value={connection.name}
                                                   onChange={self.onValueChange('in', i, 'name')}
                                                   disabled={connection.disabled}>
                                            </input>
                                        </td>
                                        <td>
                                            <input className="form-control"
                                                   style={{marginRight: "10px"}}
                                                   value={connection.desc}
                                                   onChange={self.onValueChange('in', i, 'desc')}
                                                   disabled={connection.disabled}>
                                            </input>
                                        </td>
                                        <td style={{
                                            verticalAlign: "middle",
                                            textAlign: "center"
                                        }}>
                                            <button
                                                className="fa fa-times btn btn-outline-danger btn-sm"
                                                onClick={self.removeConnection("in", i)}
                                                disabled={connection.disabled}/>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>


                <div className="card" style={{display: "block"}}>
                    <div className="card-header font-bold"
                         style={{display: "flex", alignItems: "center"}}>
                        <h4 className="pull-left" style={{flexGrow: 1}}>Outgoing connections</h4>
                        <div className="btn-group">
                            <button className="fa fa-plus btn btn-outline-primary btn-sm"
                                    onClick={this.addConnection("out")}/>
                        </div>
                    </div>
                    <table
                        className="table table-right mb-0">
                        <thead>
                        <tr className="text-center">
                            <th className="border-bottom-0 border-top-0" style={{width: "15%"}}>Type</th>
                            <th className="border-bottom-0 border-top-0" style={{width: "20%"}}>Name</th>
                            <th className="border-bottom-0 border-top-0" style={{width: "55%"}}>Description</th>
                            <th className="border-bottom-0 border-top-0" style={{width: "10%"}}>Remove</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            this.props.schema.outConnections.map(function (connection, i) {
                                return (
                                    <tr key={i}>
                                        <td>
                                            <div className="dropdown" style={{position: "static"}}>
                                                <button className="btn btn-secondary dropdown-toggle" type="button"
                                                        data-toggle="dropdown"
                                                        style={{
                                                            width: "100%",
                                                            textAlign: "left",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            flexDirection: "row",
                                                            justifyContent: "center"
                                                        }}
                                                        disabled={connection.disabled}>
                                                        <span
                                                            className="fa mr-2">{ConnectionTypes.icons[connection.type]}</span>
                                                    {ConnectionTypes.labels_short[connection.type]}
                                                </button>
                                                <div className="dropdown-menu">
                                                    {
                                                        ConnectionTypes.types.map(function (connType) {
                                                            return <a className="dropdown-item"
                                                                      href="#" onClick={function () {
                                                                return self.modConnection('out', i, 'type', connType)
                                                            }}>
                                                                    <span
                                                                        className="fa">{ConnectionTypes.icons[connType]}</span>
                                                                {ConnectionTypes.labels_short[connType]}
                                                            </a>
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <input className="form-control"
                                                   style={{marginRight: "10px"}}
                                                   value={connection.name}
                                                   onChange={self.onValueChange('out', i, 'name')}
                                                   disabled={connection.disabled}>
                                            </input>
                                        </td>
                                        <td>
                                            <input className="form-control"
                                                   style={{marginRight: "10px"}}
                                                   value={connection.desc}
                                                   onChange={self.onValueChange('out', i, 'desc')}
                                                   disabled={connection.disabled}>
                                            </input>
                                        </td>
                                        <td style={{
                                            verticalAlign: "middle",
                                            textAlign: "center"
                                        }}>
                                            <button
                                                className="fa fa-times btn btn-outline-danger btn-sm"
                                                onClick={self.removeConnection("out", i)}
                                                disabled={connection.disabled}/>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </table>
                </div>


            </div>
        );

        var leftComponents = [{title: "Description", component: descriptionContent, icon: "fa fa-audio-description"},
            {title: "Connections", component: connectionContent, icon: "fa fa-random"}];

        return (
            <div className="container-content row wrap-cols mh-0">
                <div className="col-6 pl-2 accordion-wrapper h-100 overflow-y p-3">
                    {
                        leftComponents.map(function (obj, i) {
                            var containerClass = "accordion-container";
                            var titleClass = "title";
                            var content;
                            var cevhronClass = "fa fa-plus";
                            if (self.props.config.open === i) {
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
    return {
        schema: state.cardCreatorSchema.schema
    };
}


module.exports = connect(mapStateToProps)(Description);
