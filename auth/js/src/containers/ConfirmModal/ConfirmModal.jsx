"use strict";

var React = require('react');
var ConfirmButton = React.createClass({

    render: function () {
        return (
            <div className="modal fade show"
                 style={{display: "block", paddingRight: "15px", backgroundColor: "rgba(0,0,0,0.8)"}}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title"><i className={this.props.icon}/>{this.props.title}</h5>
                            <button type="button" className="close" onClick={this.props.onClose}>
                                <span>×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{this.props.description}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={this.props.onClose}>Close
                            </button>
                            <button type="button" className="btn btn-danger" onClick={this.props.onConfirm}>Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = ConfirmButton;