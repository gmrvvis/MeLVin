"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var actionTypes = require('./../../actions/ActionTypes');

var ErrorBanner = React.createClass({

    _onClose: function () {
        this.props.dispatch({type: actionTypes.HIDE_ERROR_MESSAGE});
    },

    render: function () {
        var showClass = "hide";
        if (this.props.showGlobalErrorMessage)
            showClass = "show";

        return (
            <div className={"alert bg-danger text-white global-working-message " + showClass} style={{
                padding: "0rem 0.75rem",
                display: "flex",
                alignItems: "center"
            }}>
                <div className="d-flex justify-content-between">
                    <h6 className="alert-heading mb-0">
                        <i className="fa fa-exclamation-circle mr-2"/>
                        {this.props.globalErrorMessage}
                        <button className="btn btn-sm btn-danger ml-3" onClick={this._onClose}>
                            <i className="fa fa-times" style={{color: "#9e2a37"}}/>
                        </button>
                    </h6>
                </div>
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        showGlobalErrorMessage: state.ui.showGlobalErrorMessage,
        globalErrorMessage: state.ui.globalErrorMessage
    };
}


module.exports = connect(mapStateToProps)(ErrorBanner);
