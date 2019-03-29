"use strict";

var React = require('react');
var DesignItem = require('./DesignListItem');
module.exports = React.createClass({


    getInitialState: function () {
        return {page: 1};
    },

    onNextPage: function () {
        this.setState({page: this.state.page + 1 < Math.ceil(Object.keys(this.props.files).length / this.filesPerPage) ? this.state.page + 1 : Math.ceil(Object.keys(this.props.files).length / this.filesPerPage)})
    },

    onPreviousPage: function () {
        this.setState({page: this.state.page - 1 > 0 ? this.state.page - 1 : 1})
    },

    onGoToPage: function (page) {
        var self = this;
        return function () {
            self.setState({page: page})
        }
    },

    onClick: function (index) {
        var self = this;
        return function () {
            self.props.onClick(index, self.props.listID)
        }
    },

    render: function () {
        var self = this;
        var fileListContent = (<div className="alert alert-info">
            No files loaded on the server.
        </div>);


        var designs = this.props.designs;
        this.filesPerPage = 12;
        if (designs.length > 0) {
            var fileComponents = [];
            var fileList = [];
            var pages = [];

            for (var i = 0; i < designs.length; i++) {
                fileList.push(
                    <DesignItem session={designs[i]}
                                onOpenEdit={this.props.onOpenEdit(i)}
                                onDownload={this.props.onDownload(designs[i].id)}
                                onCloseSession={this.props.onCloseSession(designs[i].id)}
                                onLoadSession={this.props.onLoadSession(designs[i].id)}
                                onOpenRemove={this.props.onOpenRemove(designs[i].id)}
                                open={designs[i].id === this.props.currentSessionID}
                    />
                );

                if ((i + 1) % this.filesPerPage === 0) {
                    fileComponents.push(<div className="row" style={{width: "100%"}}>{fileList}</div>);
                    fileList = [];
                    pages.push(Math.ceil(i / this.filesPerPage));
                }

            }

            if (designs.length < this.filesPerPage || designs.length % this.filesPerPage > 0) fileComponents.push(<div
                className="row" style={{width: "100%"}}>{fileList}</div>);
            if (designs.length % this.filesPerPage > 0) pages.push(Math.ceil(i / this.filesPerPage));

            fileComponents = [fileComponents[(this.state.page - 1)]];
            var pagination;
            if (designs.length > this.filesPerPage) {
                pagination = <nav className={"pagination-navbar"}>
                    <ul className="pagination">
                        <li className="page-item">
                            <a  className="page-link" href="#" onClick={this.onPreviousPage}>
                                <span>&laquo;</span>
                            </a>
                        </li>
                        {
                            pages.map(function (pageNumber) {
                                var className = pageNumber === self.state.page ? "page-item active" : "page-item";
                                return (
                                    <li className={className}>
                                        <a className="page-link" href="#" onClick={self.onGoToPage(pageNumber)}>{pageNumber}</a>
                                    </li>
                                )
                            })
                        }
                        <li className="page-item">
                            <a  className="page-link" href="#" onClick={this.onNextPage}>
                                <span>&raquo;</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            }
            fileListContent = (
                <div className="pt-3 pb-3 d-flex flex-grow-1 flex-column">
                    <div className="container-fluid flex-grow-1 flex-1 d-flex">
                        {fileComponents}
                    </div>
                    {pagination}
                </div>
            )
        }

        return fileListContent

    }
});