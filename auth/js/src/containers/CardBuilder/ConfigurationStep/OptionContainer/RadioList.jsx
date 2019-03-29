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
                    <label>Default selected index</label>
                    <input className="form-control"
                           onChange={this.props.onValueChange(this.props.index, 'selectedIndex')}
                           value={this.props.option.selectedIndex}/>
                </div>
                <div className="col-md-12 col-xl-12 mb-3">
                    <label>Help text</label>
                    <input className="form-control"
                           onChange={this.props.onValueChange(this.props.index, 'help')}
                           value={this.props.option.help}/>
                    <small className="form-text text-muted">
                        Won't be created if let empty.
                    </small>
                </div>
                <div className="col-md-12 col-xl-12 mb-3">
                    <label>List of values</label>
                    <input className="form-control"
                           onChange={this.props.onValueChange(this.props.index, 'values')}
                           value={this.props.option.values}/>
                    <small className="form-text text-muted">
                        Comma separated list of labels: A, B, C
                    </small>
                </div>
            </div>
        )
    }
});

