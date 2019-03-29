"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');

var LightBox = require('../FileUpload/LightBox');
var FileUploader = require('../FileUpload/FileUpload');

var FileUpload = React.createClass({


    onClose() {
        clearInterval(this.timer);
        this.props.dispatch({type: ActionTypes.HIDE_MESSAGE});
    },

    componentDidUpdate() {
        this.timer = setInterval(this.onClose, 2000);

    },

    render: function () {
        var fadeClass = "fade-out";
        if (this.props.showMessage)
            fadeClass = "fade-in";

        var headingIconClass;
        switch(this.props.message.category){
            case 0:
                headingIconClass = "fa fa-check text-success mr-2";
                break;
            case 1:
                headingIconClass = "fa fa-times text-danger mr-2";
                break;
            default:
                break;
        }

        return (
            <div className={"alert bg-dark text-white global-message " + fadeClass}>
                <div className="d-flex justify-content-between">
                    <h4 className="alert-heading mb-0"><i className={headingIconClass}/>{this.props.message.title}
                    </h4>
                    <button type="button" className="close text-white" onClick={this.onClose}><i
                        className="fa fa-times"/>
                    </button>
                </div>
                <hr/>
                <p className="mb-0">{this.props.message.description}</p>
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        showMessage: state.ui.showGlobalMessage,
        message: state.ui.globalMessage
    };
}


module.exports = connect(mapStateToProps)(FileUpload);
