"use strict";

var React = require('react');
module.exports = React.createClass({

    render: function () {
        return (
            <div className="form-group mb-3">
                <div className="d-flex justify-content-between">
                    <label className="col-form-label pb-1 pt-1">{this.props.option.label}</label>
                    <button type="button" className="align-self-center btn btn-outline-primary btn-sm">
                        <span className="fa fa-plus"/>
                    </button>
                </div>
                <small>
                    {this.props.option.help}
                </small>
                <hr className="mt-1 mb-2"/>
                {
                    this.props.attrs.map(function (value) {
                        return (
                            <div className="input-group mb-2">
                                <input type="text" className="form-control" spellCheck="false"
                                       disabled value={value}/>
                                <div className="input-group-append">
                                    <button type="button"
                                            className="btn btn-outline-secondary">
                                        <span className="fa fa-pen"/>
                                    </button>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

});

