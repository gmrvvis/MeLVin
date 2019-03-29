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
            var values = this.props.option.values.split(', ').join(',').split(' ,').join(',').split(',');
            var selectedIndex = parseInt(this.props.option.selectedIndex);
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

        //FIXME: not updating choice in preview
        return (
            <div className="mb-3">
                <label className="col-form-label pb-1">{this.props.option.label}</label>
                {select}
                <small>
                    {this.props.option.help}
                </small>
            </div>
        )
    }

});

