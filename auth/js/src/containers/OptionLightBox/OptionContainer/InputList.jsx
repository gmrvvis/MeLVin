"use strict";

var React = require('react');

module.exports = React.createClass({

    render: function () {
        return (
            <div className="row">
                <div className="col-md-12  col-xl-6 mb-3">
                    <label>Title</label>
                    <input className="form-control"
                           onChange={this.props.onValueChange(this.props.index, 'label')}
                           value={this.props.option.label}/>
                </div>
                <div className="col-md-12 col-xl-6 mb-3">
                    <label>Help text</label>
                    <input className="form-control"
                           onChange={this.props.onValueChange(this.props.index, 'help')}
                           value={this.props.option.help}/>
                    <small className="form-text text-muted">
                        Won't be created if let empty.
                    </small>
                </div>
            </div>
        )
    }
});

