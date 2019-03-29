"use strict";

var React = require('react');

module.exports = React.createClass({

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

    render: function () {
        this.version = this.props.file.version;
        this.defaultID = this.props.file.defaultID;
        this.uniqueID = this.props.file.uniqueID;

        var fileComponent;
            var className = this.props.active ? 'file-container active' : 'file-container';
            var cornerIcon = this.props.active ? 'glyphicon glyphicon-ok corner-check' : '';
            fileComponent = (
                <div className="col-4 mb-3">
                    <div className={className}>
                        <div className="file" onClick={this.props.onClick}>
                            <img src={"./auth/previews/"+this.props.file}/>
                            <span className="title">
                                {this.props.file}
                            </span>
                            <span className="sub-title">
                                 {this.getFormttedSize(this.props.file.size)}
                            </span>
                            <div className="corner"/>
                            <span className={cornerIcon}></span>
                        </div>
                    </div>
                </div>
            );

        return fileComponent;

    }
});