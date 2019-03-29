"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');

var LightBox = require('../FileUpload/LightBox');
var FileUploader = require('../FileUpload/FileUpload');

var FileUpload = React.createClass({


    render: function () {
        var self = this;
        var showClass = "hide";
        if (this.props.showGlobalWorkingMessage)
            showClass = "show";

        var message = this.props.currentlyWorkingIds.map(function (cardID) {
            return self.props.cards.byId[cardID].title + " " +cardID
        });
        
        return (
            <div className={"alert bg-primary text-white global-working-message " + showClass}>
                <div className="d-flex justify-content-between">
                    <h5 className="alert-heading mb-0"><i className="fa fa-spinner fa-spin mr-3"/>{"Cards working: "+message.join(', ')}
                    </h5>
                </div>
                <hr/>
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        cards: state.cards,
        showGlobalWorkingMessage: state.ui.showGlobalWorkingMessage,
        currentlyWorkingIds: state.ui.currentlyWorkingIds
    };
}


module.exports = connect(mapStateToProps)(FileUpload);
