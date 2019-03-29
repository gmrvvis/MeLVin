"use strict";

var React = require('react');
module.exports = React.createClass({
    render: function () {
        var checkBoxes = (
            <div className="alert alert-danger" role="alert">
                Incorrect list of values or states
            </div>
        );
        try {
            var values = this.props.option.values.split(', ').join(',').split(' ,').join(',').split(',');
            var states = this.props.option.states.split(', ').join(',').split(' ,').join(',').split(',');
            checkBoxes = values.map(function (value, i) {
                return (
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={states[i] === "1"}/>
                        <label className="form-check-label">
                            {value}
                        </label>
                    </div>
                )
            })
        }
        catch (e) {
        }

        return (
            <div className="form-group mb-3">
                <div className="d-flex flex-column pb-1">
                    <label className="col-form-label pb-0">{this.props.option.label}</label>
                    <small>
                        {this.props.option.help}
                    </small>
                </div>
                <hr className="mt-0 mb-2"/>
                {checkBoxes}
            </div>
        )
    }
});

