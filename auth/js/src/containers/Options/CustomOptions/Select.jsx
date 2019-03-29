"use strict";

var React = require('react');
module.exports = React.createClass({

    render: function () {
        var select = (
            <div className="alert alert-danger" role="alert">
                Incorrect list of values
            </div>
        );
        try {
            var values = this.props.generalOptions.values.split(', ').join(',').split(' ,').join(',').split(',');
            var selectedIndex = parseInt(this.props.specificOptions.selectedIndex);
            var selectedValue = selectedIndex > 0 && selectedIndex <= values.length ? values[selectedIndex - 1] : "";
            select = (
                <div className="input-group">
                    <select className="custom-select" defaultValue={selectedValue}>
                        {
                            values.map(function (value) {
                                return (
                                    <option value={value}>{value}</option>
                                );
                            })
                        }
                    </select>
                </div>
            );
        }
        catch (e) {
        }

        //TODO: update choice in preview
        return (
            <div>
                <label className="col-form-label pb-1">{this.props.generalOptions.label}</label>
                {select}
                <small>
                    {this.props.generalOptions.help}
                </small>
            </div>
        )
    }

});

