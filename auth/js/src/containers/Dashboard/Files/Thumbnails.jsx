"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var LightBoxFileUpload = require('../../FileUpload/LightBoxContainer');
var ContentContainer = require('../ContentContainer');
var Card = require('../Card');

var Thumbnails = React.createClass({


    getInitialState: function () {
        return {fadeIn: false, showFileUpload: false, oldFileName: "", newFileName: ""}
    },

    onShowDashboard: function () {
        var self = this;
        this.setState({fadeIn: false});
        setTimeout(function () {
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "Home"})
        }, 200);
    },

    onHideFileUpload: function () {
        this.setState({showFileUpload: false})
    },

    onShowFileUpload: function () {
        this.setState({showFileUpload: true})
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.setState({fadeIn: true})
        }, 10);
    },

    onRemoveFile: function (name) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.REMOVE_PREVIEW, name: name});
        }
    },

    onRemoveAllFiles: function () {
        this.props.dispatch({type: ActionTypes.REMOVE_ALL_PREVIEWS});
    },

    downloadFile: function (path) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.DOWNLOAD_FILE, path: './auth/previews/' + path});
        }
    },

    openEditName: function (filename) {
        var self = this;
        return function () {
            var basename = filename.split('.');
            basename.pop();
            self.setState({oldFileName: filename, newFileName: basename.join('.')})
        }
    },

    onCancelEdit: function () {
        this.setState({oldFileName: ""})
    },

    onChangeName: function () {
        this.props.dispatch({
            type: ActionTypes.RENAME_PREVIEW,
            oldFileName: this.state.oldFileName,
            newFileName: this.state.newFileName
        });
        this.setState({oldFileName: "", newFileName: ""})
    },

    onTextChange: function () {
        var self = this;
        return function (event) {
            self.setState({newFileName: event.target.value});
        }
    },

    render: function () {
        var self = this;
        var buttons = [{action: this.onShowFileUpload, text: 'Upload file', iconClass: 'fa fa-upload'}];

        if (this.props.previewFiles.length > 1) {
            buttons.push({action: this.onRemoveAllFiles, text: 'Remove all', iconClass: 'fa fa-trash'});
        }

        var thumbnails = (<div className="d-flex h-100 w-100 justify-content-center align-items-center">
            <h3>No thumbnails loaded</h3>
        </div>);
        
        if (this.props.previewFiles.length > 0) {
            thumbnails = this.props.previewFiles.map(function (fileName) {
                var footer;
                if (self.state.oldFileName === fileName) {
                    footer = (
                        <div className="input-group">
                            <input type="text"
                                   className="form-control"
                                   spellCheck="false"
                                   value={self.state.newFileName}
                                   onChange={self.onTextChange()}/>
                            <div className="input-group-append">
                                <button type="button"
                                        className="btn btn-outline-success"
                                        onClick={self.onChangeName}>
                                    <span className="fa fa-check-circle"/>
                                </button>
                                <button type="button"
                                        className="btn btn-outline-danger"
                                        onClick={self.onCancelEdit}>
                                    <span className="fa fa-times-circle"/>
                                </button>
                            </div>
                        </div>
                    );
                } else {
                    footer = <div className="row vertical-align">
                        <div className="flex-grow title">
                            <h6 className="m-0">{fileName}</h6>
                        </div>
                        <div>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={self.downloadFile(fileName)}
                            >
                                <span className="fa fa-save"/>
                            </button>
                        </div>
                        <div className="ml-1">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={self.openEditName(fileName)}
                            >
                                <span className="fa fa-pen"/>
                            </button>
                        </div>
                        <div className="ml-1">
                            <button className="btn btn-outline-secondary btn-sm"
                                    onClick={self.onRemoveFile(fileName)}>
                                <span className="fa fa-trash"/>
                            </button>
                        </div>
                    </div>
                }

                return (
                    <div className='col-md-12 col-lg-6 col-xl-3 mb-3 mt-3'>
                        <div className="card bg-light h-100 d-flex flex-grow">
                            <div className="card-body p-0 flex-grow d-flex align-items-center justify-content-center ">
                                <div className="thumbnail m-bottom-0 border-0">
                                    <img src={"./auth/previews/" + fileName}
                                         className="disable-events thumbnail-image"/>
                                </div>
                            </div>
                            <div className='card-footer' style={{borderTop: "1px solid #ddd"}}>
                                <div className="container-fluid">
                                    {footer}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        var fileUpload;
        if (this.state.showFileUpload)
            fileUpload = <LightBoxFileUpload onClose={this.onHideFileUpload} path={'./auth/uploadPreview'}/>;

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";
        return (
            <ContentContainer fadeClass={fadeClass}
                              fileUpload={fileUpload}
                              buttons={buttons}
                              cards={thumbnails}
                              title={'Files'}
                              subtitle={'Thumbnails'}
                              onShowDashboard={this.onShowDashboard}/>
            // <div className={"container-fluid pt-5 pb-5 d-flex justify-content-center home-page " + fadeClass}
            //      style={{height: "calc(100vh - 60px)"}}>
            //     {fileUpload}
            //     <div className="home-page-container d-flex flex-column h-100">
            //         <div className="row mb-4 d-flex align-items-center">
            //             <button type="button" className="btn btn-dark mr-2"
            //                     onClick={this.onShowDashboard}>
            //                 <i className="fa fa-chevron-left"/>
            //             </button>
            //             <h2 className="mb-0">
            //                 Files
            //             </h2>
            //         </div>
            //         <div className="row flex-grow">
            //             <div className="container-fluid h-100 h-100 d-flex flex-column">
            //                 <div className="row d-flex justify-content-between mb-2">
            //                     <h3 className="mb-0 mt-0">
            //                         <small className="text-muted">Thumbnails</small>
            //                     </h3>
            //                     <div className="d-flex align-items-center">
            //                         <button type="button" className="btn btn-sm btn-outline-dark mr-2"
            //                                 onClick={this.onShowFileUpload}>
            //                             <i className="fa fa-upload mr-1"/>
            //                             Upload file
            //                         </button>
            //                         {removeAllButton}
            //                     </div>
            //                 </div>
            //                 <div className={"row home-card pt-3 flex-grow-1 " + emptyClass}
            //                      style={{overflowY: "auto", overflowX: "hidden"}}>
            //                     {thumbnails}
            //                 </div>
            //             </div>
            //         </div>
            //     </div>
            // </div>
        )
    }
});

function mapStateToProps(state) {
    return {
        previewFiles: state.ui.previewFiles,
    };
}


module.exports = connect(mapStateToProps)(Thumbnails);
