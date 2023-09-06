"use strict";

var React = require('react');
var ContentContainer = React.createClass({
    render: function () {
        var containerClass = this.props.contract ? 'row' : 'row flex-grow height-0';
        return (
            <div className={"container-fluid pt-5 pb-5 d-flex justify-content-center home-page " + this.props.fadeClass}
                 style={{height: "calc(100vh - 60px)"}}>
                {this.props.fileUpload}
                {this.props.removeConfirmation}
                <div className="home-page-container d-flex flex-column h-100">
                    <div className="row mb-4 d-flex align-items-center">
                        <button type="button" className="btn btn-dark mr-2"
                                onClick={this.props.onShowDashboard}>
                            <i className="fa fa-chevron-left"/>
                        </button>
                        <h2 className="mb-0">
                            {this.props.title}
                        </h2>
                    </div>
                    <div className={containerClass}>
                        <div className="container-fluid h-100 h-100 d-flex flex-column">
                            <div className="row d-flex justify-content-between mb-2">
                                <h3 className="mb-0 mt-0">
                                    <small className="text-muted">{this.props.subtitle}</small>
                                </h3>
                                <div className="d-flex align-items-center">
                                    {this.props.buttons.map(function (buttonDesc) {
                                        return (
                                            <button type="button" className="btn btn-sm btn-outline-dark ml-2"
                                                    onClick={buttonDesc.action}>
                                                <i className={buttonDesc.iconClass+' mr-1'}/>
                                                {buttonDesc.text}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="row home-card pt-3 flex-grow-1"
                                 style={{overflowY: "auto", overflowX: "hidden"}}>
                                {this.props.cards}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = ContentContainer;