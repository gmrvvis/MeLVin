"use strict";

var React = require('react');
module.exports = React.createClass({
    render: function () {
        var self = this;
        var radioList = (
            <div className="alert alert-danger" role="alert">
                Incorrect list of values
            </div>
        );
        try {
            var values = this.props.option.values.split(', ').join(',').split(' ,').join(',').split(',');
            var selectedIndex = this.props.option.selectedIndex;
            radioList = values.map(function (value, i) {
                return (
                    <div className="form-check">
                        <input className="form-check-input" type="radio" name={"radio" + self.props.index}
                               checked={((i + 1) + "") === selectedIndex}/>
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
                {radioList}
            </div>
        )
    }
});

