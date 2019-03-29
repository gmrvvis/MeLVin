"use strict";

var React = require('react');
module.exports = React.createClass({

    getInitialState: function () {
        return {
            editing: Array(this.props.specificOptions.value.length).fill(false),
            value: this.props.specificOptions.value
        }
    },

    onEdit: function (index) {
        var self = this;
        return function () {
            var editing = self.state.editing;
            editing[index] = true;
            self.setState({editing: editing})
        }
    },

    onCancelEdit: function (index) {
        var self = this;
        return function () {
            var editing = self.state.editing;
            editing[index] = false;
            var values = self.state.value;
            values[index] = self.props.specificOptions.value[index];

            self.setState({editing: editing, value: values})
        }
    },

    onSaveEdit: function (index) {
        var self = this;
        return function () {
            var editing = self.state.editing;
            editing[index] = false;
            self.props.onUpdateOption("value", self.state.value);
            self.setState({editing: editing})
        }
    },

    onChange: function (index) {
        var self = this;
        return function (event) {
            var values = self.state.value;
            values[index] = event.target.value;
            self.setState({value: values});
        }
    },

    onAddValue: function () {
        var values = this.props.specificOptions.value.concat([]);
        values.push("");
        this.props.onUpdateOption("value", values);
    },

    onRemoveValue: function (index) {
        var self = this;
        return function () {
            var values = self.props.specificOptions.value.concat([]);
            values.splice(index, 1);
            self.props.onUpdateOption("value", values);
        }
    },

    onLock: function () {
        this.props.onUpdateOption("locked", !this.props.specificOptions.locked);
    },

    componentDidUpdate: function (prevProps, prevState) {
        if (this.props.specificOptions.value.length !== prevProps.specificOptions.value.length) {
            var self = this;
            var editing = this.props.specificOptions.value.map(function (value, i) {
                return prevState.editing[i] || false;
            });

            var values = editing.map(function (value, i) {
                return value ? prevState.value[i] : self.props.specificOptions.value[i];
            });

            this.setState({editing: editing, value: values});
        }
    },

    render: function () {
        var self = this;
        var help;
        if (this.props.generalOptions.help && this.props.generalOptions.help.length > 0)
            help = (
                <small>
                    {this.props.generalOptions.help}
                </small>
            );


        var inputs = this.props.specificOptions.value.map(function (value, i) {

            var editingOptions;
            if (!self.props.specificOptions.locked || !self.props.inPanel) {
                editingOptions = (
                    <div className="input-group-append">
                        <button key={i + "-3"}
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={self.onEdit(i)}>
                            <span className="fa fa-pen"/>
                        </button>
                        <button key={i + "-4"}
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={self.onRemoveValue(i)}>
                            <span className="fa fa-trash"/>
                        </button>
                    </div>
                );
            }

            var input = (
                <div className="input-group mb-2">
                    <input type="text" className="form-control" spellCheck="false"
                           disabled defaultValue={value}/>
                    {editingOptions}
                </div>
            );

            //Keys on button prevents focus style from persisting
            if (self.state.editing[i]) {
                input = (
                    <div className="input-group mb-2">
                        <input type="text"
                               className="form-control"
                               spellCheck="false" defaultValue={value}
                               onChange={self.onChange(i)}/>
                        <div className="input-group-append">
                            <button key={i + "-0"}
                                    type="button"
                                    className="btn btn-outline-success"
                                    onClick={self.onSaveEdit(i)}>
                                <span className="fa fa-check-circle"/>
                            </button>
                            <button key={i + "-1"}
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={self.onCancelEdit(i)}>
                                <span className="fa fa-times-circle"/>
                            </button>
                        </div>
                    </div>
                );
            }


            return input;
        });

        var actionButtons;
        if (!self.props.specificOptions.locked || !self.props.inPanel) {
            var lockClass = this.props.specificOptions.locked ? "btn-secondary" : "btn-outline-secondary";
            var lockIcon = this.props.specificOptions.locked ? "fa fa-lock" : "fa fa-lock-open";
            var lockButton;
            if (!self.props.inPanel) {
                lockButton = (
                    <button type="button" className={"align-self-center mr-2 btn btn-sm " + lockClass}
                            onClick={this.onLock}>
                        <span className={lockIcon}/>
                    </button>
                );
            }
            actionButtons = (
                <div className="d-flex">
                    {lockButton}
                    <button type="button" className="align-self-center btn btn-outline-secondary btn-sm"
                            onClick={this.onAddValue}>
                        <span className="fa fa-plus"/>
                    </button>
                </div>
            );
        }

        return (
            <div>
                <div className="d-flex flex-column pb-0 pt-1">
                    <div className="d-flex justify-content-between">
                        <label className="col-form-label pb-0 font-weight-bold">
                            {this.props.generalOptions.label}
                        </label>
                        {actionButtons}
                    </div>
                    <div className="d-flex flex-row align-items-center pl-2">
                        <label className="col-form-label text-muted pt-0 pb-0">
                            Identifier: <span className="font-bold">{(this.props.generalOptions.id || 'Not set')}</span>
                        </label>
                        <button className="btn btn-light btn-sm text-muted btn-empty">
                            <i className="fa fa-pen"/>
                        </button>
                    </div>
                </div>
                <hr className="mt-1 mb-2"/>
                <div className="pl-2">
                    {inputs}
                </div>
            </div>
        )
    }

});