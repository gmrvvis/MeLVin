"use strict";

var React = require('react');
module.exports = React.createClass({
    render: function () {

        var values = this.props.generalOptions.values.split(', ').join(',').split(' ,').join(',').split(',');
        var states = this.props.specificOptions.checked;
        var checkBoxes = values.map(function (value, i) {
            return (
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={states[i] === "1"}/>
                    <label className="form-check-label">
                        {value}
                    </label>
                </div>
            )
        });


        return (
            <div>
                <div className="d-flex flex-column pb-1">
                    <label className="col-form-label pb-0">{this.props.generalOptions.label}</label>
                    <small>
                        {this.props.generalOptions.help}
                    </small>
                </div>
                <hr className="mt-0 mb-2"/>
                {checkBoxes}
            </div>
        )
    }
});

