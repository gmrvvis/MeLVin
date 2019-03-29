"use strict";

var React = require('react');
module.exports = React.createClass({

    render: function () {
        return (
            <div className="form-group mb-3">
                <label className="col-form-label">{this.props.option.label}</label>
                <div className="input-group">
                    <input type="text" placeholder={this.props.option.placeholder} className="form-control" spellCheck="false"
                           disabled/>
                    <div className="input-group-append">
                        <button type="button"
                                className="btn btn-outline-secondary">
                            <span className="fa fa-pen"/>
                        </button>
                    </div>
                </div>
                <small>
                    {this.props.option.help}
                </small>
            </div>
        )
    }

});

