"use strict";

var React = require('react');
var ContentContainer = React.createClass({
    render: function () {

        return (
            <div className='col-md-12 col-lg-6 col-xl-3 mb-3 mt-3'>
                <div className="card bg-light h-100 d-flex flex-column flex-grow">
                    <div className="card-body padding-0 flex-grow d-flex justify-content-center align-items-center">
                        <div className="thumbnail m-bottom-0 border-0">
                            <img src={"./" + this.props.thumbnail}
                                 className="disable-events thumbnail-image"/>
                        </div>
                    </div>
                    <div className='card-footer' style={{borderTop: "1px solid #ddd"}}>
                        <div className="container-fluid">
                            <div className="row vertical-align">
                                <div className="flex-grow title">
                                    <h6 className="m-0 font-bold">{this.props.name}</h6>
                                </div>
                                <div>
                                    <button className="btn btn-outline-secondary btn-sm"
                                            onClick={this.props.onDownload}>
                                        <i className="fa fa-save"/>
                                    </button>
                                </div>
                                <div className="ml-1">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={this.props.onEdit}>
                                        <i className="fa fa-pen"/>
                                    </button>
                                </div>
                                <div className="ml-1">
                                    <button className="btn btn-outline-secondary btn-sm" onClick={this.props.onRemove}>
                                        <i className="fa fa-trash"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = ContentContainer;