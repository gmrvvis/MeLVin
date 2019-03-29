"use strict";

var React = require('react');

module.exports = React.createClass({

    getInitialState: function () {
        return {configured: true};
    },

    onSaveConfiguration: function () {
        this.props.onUpdateFileOption(this.props.file.name, 'version', this.version);
        this.props.onUpdateFileOption(this.props.file.name, 'defaultID', this.defaultID);
        this.props.onUpdateFileOption(this.props.file.name, 'uniqueID', this.uniqueID);
        this.props.onUpdateFileOption(this.props.file.name, 'order', this.order);
        this.setState({configured: true});
    },

    onEditConfiguration: function () {
        this.setState({configured: false});
    },

    getFormttedSize: function (size) {
        var units = ["bytes", "KB", "MB", "GB", "TB"];
        var unitIndex = 0;
        while (size > 1024) {
            size /= 1024;
            unitIndex++;
        }

        if ((size + '').indexOf('.') >= 0) {
            var splitNumber = (size + '').split('.');
            var fractionalPart = (splitNumber.pop() + '').substring(0, 2);
            var integerPart = splitNumber.pop();

            return integerPart + '.' + fractionalPart + ' ' + units[unitIndex];
        }
        else {
            return size + ' ' + units[unitIndex];
        }
    },

    onPropertyChange: function (property) {
        var self = this;
        return function (event) {
            self[property] = event.target.value;
        }
    },


    render: function () {
        this.version = this.props.file.version;
        this.defaultID = this.props.file.defaultID;
        this.uniqueID = this.props.file.uniqueID;

        var fileComponent;
        if (this.state.configured) {
            var className = this.props.active ? 'file-container active' : 'file-container';
            var cornerIcon = this.props.active ? 'glyphicon glyphicon-ok corner-check' : '';
            fileComponent = (
                <div className="col-4 mb-3">
                    <div className={className}>
                        <div className="file" onClick={this.props.onClick}>
                            <img src="./auth/assets/images/js.svg"/>
                            <span className="title">
                                {this.props.file.name}
                            </span>
                            <span className="sub-title">
                                 {this.getFormttedSize(this.props.file.size)}
                            </span>
                            <div className="corner"/>
                            <span className={cornerIcon}></span>
                        </div>
                        <div className="file-footer">
                            <div className="description">
                                <span className="sub-title">{"Unique ID: "}
                                    <span style={{fontWeight: "bold"}}>{this.props.file.uniqueID}</span>
                                </span>
                                <span className="sub-title">{"Version: "}
                                    <span style={{fontWeight: "bold"}}>{this.props.file.version}</span>
                                </span>
                                <span className="sub-title">{"Load order: "}
                                    <span style={{fontWeight: "bold"}}>{this.props.file.order}</span>
                                </span>
                            </div>
                            <div>
                                <button className="btn btn-primary btn-sm btn-empty edit"
                                        onClick={this.onEditConfiguration}>
                                    <span className="fa fa-pen"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            fileComponent = (
                <div className="col-4 mb-3">
                    <div className="edit-container">
                        <div className="title"><span>{this.props.file.name}</span></div>
                        <div className="form-horizontal">
                            <div className="input-container">
                                <span>Version</span>
                                <div className="input">
                                    <input type="text" className="form-control" defaultValue={this.props.file.version}
                                           onChange={this.onPropertyChange("version")}/>
                                </div>
                            </div>
                            <div className="input-container">
                                <span>Default ID</span>
                                <div className="input">
                                    <input type="text" className="form-control"
                                           defaultValue={this.props.file.defaultID}
                                           onChange={this.onPropertyChange("defaultID")}/>
                                </div>
                            </div>
                            <div className="input-container">
                                <span>Unique ID</span>
                                <div className="input">
                                    <input type="text" className="form-control"
                                           defaultValue={this.props.file.uniqueID}
                                           onChange={this.onPropertyChange("uniqueID")}/>
                                </div>
                            </div>
                            <div className="input-container">
                                <span>Load order</span>
                                <div className="input">
                                    <input type="text" className="form-control"
                                           defaultValue={this.props.file.order}
                                           onChange={this.onPropertyChange("order")}/>
                                </div>
                            </div>
                        </div>
                        <div style={{padding: "10px"}}>
                            <button className='btn btn-success' onClick={this.onSaveConfiguration}>
                                <span className="fa fa-check"></span> Save
                            </button>
                        </div>
                    </div>
                </div>
            )

        }

        return fileComponent;

    }
});