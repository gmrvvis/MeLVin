"use strict";

var React = require('react');
module.exports = React.createClass({

    render: function () {
        return (
            <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" checked={this.props.option.checked}/>
                <label className="form-check-label">
                    {this.props.option.label}
                </label>
            </div>
        )
    }

});

