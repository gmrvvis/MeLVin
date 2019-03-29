"use strict";

var React = require('react');
var connect = require("react-redux").connect;

var FullScreenLoading = React.createClass({


    render: function () {
        return (
            <div className="modal full-screen-loader" style={{display: "flex"}}>
                <div className="container-fluid">
                    <div id="content">
                        <div className="content">
                            <div className="row">
                                <div className="form-container">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="page-header margin-top-0">
                                                <div className="logo-container">
                                                    <h1 className="display-2">MeLVin</h1>
                                                </div>
                                            </div>
                                            <div className="load-image p-3">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <i className="fa fa-cog fa-spin fa-3x"/>
                                                    <div className="d-flex flex-column  align-items-center">
                                                        <i className="fa fa-cog fa-spin fa-2x mb-2"/>
                                                        <i className="fa fa-cog fa-spin fa-2x ml-3"/>
                                                    </div>
                                                </div>
                                                <h4 className="mb-0">{this.props.loadingMessage}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
});

function mapStateToProps(state) {
    return {
        loading: state.ui.loading,
        loadingMessage: state.ui.loadingMessage
    };
}

module.exports = connect(mapStateToProps)(FullScreenLoading);