"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');

var ConnectionDescription = require('./DescriptionStep/Description');

var VizCreator = React.createClass({

    getInitialState: function () {
        return {fadeIn: false}
    },

    onShowDashboard: function () {
        var self = this;
        this.setState({fadeIn: false});
        setTimeout(function () {
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "Home"})
        }, 200);
    },

    onSaveConnection: function () {
        this.props.dispatch({type: ActionTypes.SEND_CUSTOM_CONN});
        this.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "ConnectionList"});
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.setState({fadeIn: true})
        }, 10);
    },

    render: function () {
        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";

        return (
            <div className={"popup-content d-flex flex-column " + fadeClass}
                 style={{
                     width: "100%",
                     height: "calc(100vh - 55px)",
                     backgroundColor: "#eeeeef",
                     transition: "all 0.2s",
                     transitionTimingFunction: "ease"
                 }}>
                <div className="pt-3 pl-3 d-flex align-items-center">
                    <button type="button" className="btn btn-dark mr-2"
                            onClick={this.onShowDashboard}>
                        <i className="fa fa-chevron-left"/>
                    </button>
                    <h2 className="mb-0">
                        Connection creation assistant
                    </h2>
                </div>
                <div className="flex-1 d-flex flex-row bg-white m-3 mh-0"
                     style={{
                         border: "1px solid #d4d4d4",
                         borderRadius: "4px",
                         boxShadow: "0 2px 2px 0px #d0d0d0"
                     }}>
                    <div className="container-p h-100">
                    <ConnectionDescription/>
                    <div className="popup-footer">
                        <button onClick={this.onSaveConnection} className="btn btn-success btn-sm">
                            <i className="fa fa-check pr-2"/>Finish
                        </button>
                    </div>
                    </div>
                </div>

            </div>
        )
    }
});

function mapStateToProps(state) {
    return {
        showCardCreator: state.cardCreatorSchema.showCardCreator,
    };
}


module.exports = connect(mapStateToProps)(VizCreator);
