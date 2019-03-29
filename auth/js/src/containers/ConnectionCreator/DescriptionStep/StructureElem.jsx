"use strict";

var React = require('react');
var cssClass = require('../../../constants/ConnectionStructTypes').cssClass;
module.exports = React.createClass({

    render: function () {
        var remove_btn;
        if (!this.props.node.root)
            remove_btn = (
                <button className="btn btn-sm btn-dark" onClick={this.props.onRemoveElem(this.props.node.id)}>
                    <i className="fa fa-trash-alt fa-fw"/>
                </button>
            );

        return (
            <div className="d-flex flex-row align-items-center">
                <div className="card mt-3 d-flex flex-row">
                    <div
                        className={'header-box ' + cssClass[this.props.node.type].className}>{cssClass[this.props.node.type].letter}</div>
                    <div
                        className="card-header bg-dark text-white d-flex align-items-center justify-content-between border-bottom-0">
                        <span className="font-weight-bold">{this.props.node.title}</span>
                        <div>
                            <button className="btn btn-sm btn-dark ml-4 mr-2"
                                    onClick={this.props.onOpenEditProperty(this.props.node.id)}>
                                <i className="fa fa-pen fa-fw"/>
                            </button>
                            {remove_btn}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});