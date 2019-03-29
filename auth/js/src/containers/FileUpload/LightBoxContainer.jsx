"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');

var LightBox = require('./LightBox');
var FileUploader = require('./FileUpload');
var FileUpload = React.createClass({

    onCloseModal: function () {
       this.props.onClose();
    },

    render: function () {
        return (
            <LightBox height={60} width={30} title={"Upload file"} onClose={this.onCloseModal}>
                <FileUploader path={this.props.path}/>
            </LightBox>
        );
    }
});

function mapStateToProps(state) {
    return {
        showFileUpload: state.ui.showFileUpload
    };
}


module.exports = connect(mapStateToProps)(FileUpload);
