"use strict";

var React = require('react');

module.exports = React.createClass({

    render: function () {
        var self = this;
        return (
            <div className="row">
                <div className="col-md-12  col-xl-6 mb-3">
                    <label>Title</label>
                    <input className="form-control"
                           onChange={this.props.onValueChange(this.props.index, 'label')}
                           value={this.props.option.label}/>
                </div>
                <div className="col-md-12  col-xl-6 mb-3 dropdown">
                    <label>Title</label>
                    <select className="custom-select" defaultValue={this.props.option.checked ? "True" : "False"}
                    onChange={function (event) {
                            return self.props.modOption(self.props.index, "checked", event.target.value === "True")
                        }}>
                        <option className="dropdown-item" value="True">True</option>
                        <option className="dropdown-item" value="False">False</option>
                    </select>
                </div>
            </div>
        )
    }
});

