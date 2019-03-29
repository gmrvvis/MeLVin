"use strict";

var React = require('react');
var connect = require("react-redux").connect;

var Input = React.createClass({

    getInitialState: function () {
        return {
            editing: false,
            value: this.props.specificOptions.value,
            editingId: false,
            valueId: (this.props.specificOptions.id || "")
        }
    },

    onEdit: function () {
        this.setState({editing: true})
    },

    onCancelEdit: function () {
        this.setState({editing: false, value: this.props.specificOptions.value})
    },

    onSaveEdit: function () {
        this.props.onUpdateOption("value", this.state.value);
        this.setState({editing: false})
    },

    onChange: function (event) {
        this.setState({value: event.target.value});
    },

    onEditId: function () {
        this.setState({editingId: true})
    },

    onCancelEditId: function () {
        this.setState({editingId: false, valueId: (this.props.specificOptions.id || "")})
    },

    onSaveEditId: function () {
        this.props.onUpdateOption("id", this.state.valueId);
        this.setState({editingId: false})
    },

    onChangeId: function (event) {
        this.setState({valueId: event.target.value});
    },

    onLock: function () {
        this.props.onUpdateOption("locked", !this.props.specificOptions.locked);
    },

    onKeyPress: function () {
        var self = this;
        return function (e) {
            if (e.key === 13 || e.which === 13 || e.keyCode === 13)
                self.onSaveEdit();
        }
    },

    render: function () {


        var help;
        if (this.props.generalOptions.help && this.props.generalOptions.help.length > 0)
            help = (
                <div className="pl-2">
                    <small>
                        {this.props.generalOptions.help}
                    </small>
                </div>
            );

        var editButton;
        if (!this.props.specificOptions.locked || !this.props.inPanel) {
            editButton = (
                <div className="input-group-append">
                    <button key="3"
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={this.onEdit}>
                        <span className="fa fa-pen"/>
                    </button>
                </div>
            );
        }

        var input = (
            <div className="input-group pl-2">
                <input type="text"
                       placeholder={this.props.generalOptions.placeholder}
                       className="form-control"
                       spellCheck="false"
                       disabled defaultValue={this.state.value}/>
                {editButton}
            </div>
        );

        var lockButton;
        if (!this.props.inPanel) {
            var lockClass = this.props.specificOptions.locked ? "btn btn-secondary" : "btn btn-outline-secondary";
            var lockIcon = this.props.specificOptions.locked ? "fa fa-lock" : "fa fa-lock-open";
            lockButton = (
                <button key="2"
                        type="button"
                        className={lockClass}
                        onClick={this.onLock}>
                    <span className={lockIcon}/>
                </button>
            );
        }

        //Keys on button prevents focus style from persisting
        if (this.state.editing) {
            input = (
                <div className="input-group pl-2">
                    <input type="text"
                           placeholder={this.props.generalOptions.placeholder}
                           className="form-control"
                           spellCheck="false" defaultValue={this.state.value}
                           onChange={this.onChange}/>
                    <div className="input-group-append">
                        {lockButton}
                        <button key="0"
                                type="button"
                                className="btn btn-outline-success"
                                onClick={this.onSaveEdit}>
                            <span className="fa fa-check-circle"/>
                        </button>
                        <button key="1"
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={this.onCancelEdit}>
                            <span className="fa fa-times-circle"/>
                        </button>
                    </div>
                </div>
            );
        }

        var identifier = (
            <div className="d-flex justify-content-between pl-1 align-items-center">
                <label className="col-form-label text-muted pt-0 pb-0">
                    <span className="font-bold">{(this.props.specificOptions.id || 'Not set')}</span>
                </label>
                <button className="btn btn-light btn-sm text-muted btn-empty" onClick={this.onEditId}>
                    <i className="fa fa-pen"/>
                </button>
            </div>
        );

        if (this.state.editingId) {
            var value = (this.props.specificOptions.id || '');
            identifier = (
                <div className="input-group pl-2">
                    <input type="text"
                           className="form-control"
                           spellCheck="false" defaultValue={value}
                           onChange={this.onChangeId}
                           onKeyPress={this.onKeyPress()}
                    />
                    <div className="input-group-append">
                        <button key="0"
                                type="button"
                                className="btn btn-outline-success"
                                onClick={this.onSaveEditId}>
                            <span className="fa fa-check-circle"/>
                        </button>
                        <button key="1"
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={this.onCancelEditId}>
                            <span className="fa fa-times-circle"/>
                        </button>
                    </div>
                </div>
            );
        }


        return (
            <div>
                <div className="d-flex flex-column">
                    <label className="col-form-label font-weight-bold pb-0 pt-0">
                        {this.props.generalOptions.label}
                    </label>
                    <div className="d-flex flex-row align-items-center pl-2">
                        <label className="col-form-label text-muted pt-0 pb-0">
                            Identifier:
                        </label>
                        {identifier}
                    </div>
                </div>
                {input}
            </div>
        )
    }

});


function mapStateToProps(state) {
    return {
        cards: state.cards,
        connections: state.connections,
        selectedCard: state.ui.selectedCard
    };
}

module.exports = connect(mapStateToProps)(Input);
