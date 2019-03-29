"use strict";

var React = require('react');
module.exports = React.createClass({

    render: function () {
        return (
            <div>
                <input className="form-check-input" type="checkbox" checked={this.props.specificOptions.checked}/>
                <label className="form-check-label">
                    {this.props.generalOptions.label}
                </label>
            </div>
        )
    }

});

