"use strict";

var React = require('react');

module.exports = React.createClass({


    getInitialState: function () {
        return {fadeIn: false}
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.setState({fadeIn: true})
        }, 10);
    },

    onClose: function() {
        var self = this;
        self.setState({fadeIn: false});
        setTimeout(function () {
            self.props.onClose()
        }, 200);
    },

    render: function () {

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";

        return (
            <div className={"modal popup-background " + fadeClass} style={{display: "flex"}}>
                <div className="popup-content" style={{
                    maxHeight: this.props.height + "vh",
                    height: this.props.height + "vh",
                    width: this.props.width + "%"
                }}>
                    <div className="header">
                        <h5 className="modal-title">{this.props.title}</h5>
                        <button type="button" className="close" onClick={this.onClose}>&times;</button>
                    </div>
                    {React.cloneElement(this.props.children, {onSuccess: this.onClose})}
                </div>
            </div>

        )
    }
});