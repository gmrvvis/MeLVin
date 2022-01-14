"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ConnectionTypes = require('./../../../constants/ConnectionTypes');

var VizPreview = React.createClass({

    render: function () {
        return (
            <div className="col-6 pl-2 pt-3 pb-3 accordion-wrapper-preview h-100">
                <div className="accordion-container d-flex h-100 flex-column">
                    <div className='title open-dim d-flex justify-content-center'>
                        <h6 className="font-weight-bold pb-2 pt-2">Preview</h6>
                    </div>
                    <div style={{backgroundColor: "#333"}}
                         className="blueprint d-flex justify-content-center align-items-center flex-column flex-grow overflow-y">
                        <div className='d-flex justify-content-center align-items-center flex-column mb-5 w-50'>
                            <h5 style={{color: "#fff", fontWeight: "bold"}}>MENU CARD</h5>
                            <div className="dragCard">
                                <div className="card d-flex flex-row">
                                    <div className="d-flex align-items-center padding-0">
                                        <div className="thumbnail m-bottom-0 border-0">
                                            <img src={'./auth/previews/' + this.props.schema.selectedPreview}
                                                 className="disable-events thumbnail-image"/>
                                        </div>
                                    </div>
                                    <div className='bg-light flex-grow-1 border-left p-2'>
                                        <div className="container-fluid">
                                            <div className="row vertical-align justify-content-between">
                                                <div className="title">
                                                    <h5 className="font-weight-bold mb-0">{this.props.schema.title}</h5>
                                                </div>
                                                <button
                                                    className='btn btn-sm btn-empty'>
                                                    <i className="fa fa-plus"/>
                                                </button>
                                            </div>
                                            <div className="row vertical-align">
                                                <div className="flex-grow description">
                                                    <h6>{this.props.schema.description}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='d-flex justify-content-center align-items-center flex-column w-35'>
                            <h5 style={{color: "#fff", fontWeight: "bold"}}>DFD CARD</h5>
                            <div className="card w-100 mb-0">
                                <div className="card-body padding-0 d-flex justify-content-center align-items-center flex-row">
                                    <div
                                        style={{flexShrink: 0, marginLeft: "5px", display: "flex", flexFlow: "column"}}>
                                        {
                                            this.props.schema.inConnections.map(function (connection) {
                                                return (<div style={{padding: "4px 0px"}}>
                                                <span>
                                                    <span
                                                        className="fa fa-fw">{ConnectionTypes.icons[connection.type]}</span>
                                                    {" " + (connection.unique ? 1 : "\u221E")}
                                                    </span>
                                                </div>)
                                            })
                                        }

                                    </div>
                                    <div className="thumbnail m-bottom-0 border-0"
                                         style={{padding: "30px 10px", width: "100%"}}>
                                        <img src={'./auth/previews/' + this.props.schema.selectedPreview} alt="..."
                                             className="disable-events" style={{maxWidth: "150px"}}/>
                                    </div>
                                    <div style={{
                                        flexShrink: 0,
                                        marginRight: "5px",
                                        display: "flex",
                                        flexFlow: "column"
                                    }}>
                                        {
                                            this.props.schema.outConnections.map(function (connection) {
                                                return (<div style={{padding: "4px 0px"}}>
                                                <span>
                                                    {(connection.unique ? 1 : "\u221E") + " "}
                                                    <span
                                                        className="fa fa-fw">{ConnectionTypes.icons[connection.type]}</span>
                                                </span>
                                                </div>)
                                            })
                                        }

                                    </div>
                                </div>
                                <div className='card-footer card-footer-blue'
                                     style={{backgroundColor: "#f8f8f8", border: "1px solid #e8e8e8"}}>
                                    <div className="row vertical-align">
                                        <div className="col text-center">
                                            <h4 style={{
                                                fontSize: "14px",
                                                marginTop: "0px"
                                            }}>{this.props.schema.title.length > 9 ? this.props.schema.title.substring(0, 10) + "..." : this.props.schema.title}
                                                <span style={{fontWeight: "500", color: "#b5b5b5"}}>0</span></h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>)
    }
});

function mapStateToProps(state) {
    return {
        schema: state.cardCreatorSchema.schema
    };
}


module.exports = connect(mapStateToProps)(VizPreview);
