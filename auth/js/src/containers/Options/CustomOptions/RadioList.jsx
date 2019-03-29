"use strict";

var React = require('react');
module.exports = React.createClass({

    onChangeSelectedIndex: function (index) {
        var self = this;
        return function () {
            self.props.onUpdateOption("selectedIndex", index);
        }
    },

    render: function () {
        var self = this;
        var radioList = (
            <div className="alert alert-danger" role="alert">
                Incorrect list of values
            </div>
        );
        try {
            var values = this.props.generalOptions.values.split(', ').join(',').split(' ,').join(',').split(',');
            var selectedIndex = this.props.specificOptions.selectedIndex;
            radioList = values.map(function (value, i) {
                return (
                    <div className="form-check">
                        <input className="form-check-input" type="radio" name={self.props.uniqueIndex}
                               checked={((i + 1) + "") === selectedIndex}
                               onChange={self.onChangeSelectedIndex((i + 1) + "")}/>
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
            <div>
                <div className="d-flex flex-column pb-1">
                    <label className="col-form-label pb-0 font-weight-bold">{this.props.generalOptions.label}</label>
                    <small>
                        {this.props.generalOptions.help}
                    </small>
                </div>
                <hr className="mt-0 mb-2"/>
                {radioList}
            </div>
        )
    }
});

