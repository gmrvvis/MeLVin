"use strict";

var React = require('react');

module.exports = React.createClass({

    parseFormat: function (time) {
        var timestamp = parseFloat(time);
        var date = new Date(timestamp);
        return date.toLocaleString();
    },

    render: function () {

        var session = this.props.session;

        var cardBodyColor = " bg-light text-dark";
        var btnOpen;
        if (this.props.open) {
            btnOpen = (
                <button key={session.id + "_close"} className="btn btn-outline-light btn-sm"
                        onClick={this.props.onCloseSession}>
                    <i className="fa fa-times-circle fa-fw"/>
                </button>
            );
        } else {
            btnOpen = (
                <button key={session.id + "_open"} className="btn btn-outline-light btn-sm"
                        onClick={this.props.onLoadSession}>
                    <i className="fa fa-folder-open fa-fw"/>
                </button>
            );

            cardBodyColor = "";
        }

        return (
            <div className={"col-4 d-flex pb-3"}>
                <div className="card flex-grow-1 text-white bg-dark"
                     style={{width: "100%"}}>
                    <div className={"card-body" + cardBodyColor}>
                        <h5 className="card-title">{session.title}</h5>
                        <p className="card-text">{session.description}</p>
                    </div>
                    <div
                        className="card-footer d-flex justify-content-between align-items-center">
                        <span>{this.parseFormat(session.lastModified)}</span>
                        <div>
                            <button className="btn btn-outline-light btn-sm mr-2" onClick={this.props.onOpenRemove}>
                                <i className="fa fa-trash"/>
                            </button>
                            <button className="btn btn-outline-light btn-sm mr-2" onClick={this.props.onDownload}>
                                <i className="fa fa-download"/>
                            </button>
                            <button className="btn btn-outline-light btn-sm mr-2" onClick={this.props.onOpenEdit}>
                                <i className="fa fa-pen"/>
                            </button>
                            {btnOpen}
                        </div>
                    </div>
                </div>
            </div>
        );

    }
});