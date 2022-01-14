"use strict";

var React = require('react');
module.exports = React.createClass({

    render: function () {
        let self = this;
        return (
            <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={this.props.specificOptions.checked} onClick={
                    function (event) {self.props.onUpdateOption("checked", event.checked)}
                }/>
                <label className="form-check-label">
                    {this.props.generalOptions.label}
                </label>
            </div>
        )
    }

});

