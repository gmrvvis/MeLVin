"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var FileUpload = require('../../FileUpload/LightBoxContainer');
var ConfirmModal = require('../../ConfirmModal/ConfirmModal');
var ContentContainer = require('../ContentContainer');
var Card = require('../Card');

var Files = React.createClass({

    getInitialState: function () {
        return {
            fadeIn: false,
            folderName: undefined,
            showFileUpload: false,
            oldFileName: "",
            newFileName: "",
            removeAll: false,
            removeName: "",
            showRemoveConfirmation: false
        }
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


    onRemove: function () {
        if (this.state.removeAll) {
            this.props.dispatch({type: ActionTypes.REMOVE_ALL_FILES});
        } else {
            this.props.dispatch({type: ActionTypes.REMOVE_FILE, name: this.state.removeName});
        }
        this.setState({showRemoveConfirmation: false});
    },

    onOpenRemove: function (name) {
        var self = this;
        return function () {
            self.setState({removeAll: false, removeName: name, showRemoveConfirmation: true});
        }
    },

    onOpenRemoveAll: function () {
        this.setState({removeAll: true, showRemoveConfirmation: true});
    },

    onCloseRemove: function () {
        this.setState({showRemoveConfirmation: false});
    },

    onOpenFolder: function (folderName) {
        var self = this;
        return function () {
            self.setState({folderName: folderName});
        }
    },

    onCloseFolder: function () {
        this.setState({folderName: undefined});
    },

    downloadFile: function (path) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.DOWNLOAD_FILE, path: './auth/files/' + path});
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
            type: ActionTypes.RENAME_FILE,
            oldFileName: this.state.oldFileName,
            newFileName: this.state.newFileName
        })
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

        let fileList = []
        if (this.state.folderName) {
            fileList = Object.values(this.props.files.folders[this.state.folderName].files)
        } else {
            fileList =  Object.values(this.props.files.folders).concat(Object.values(this.props.files.files))
        }

        var buttons = [{action: this.onShowFileUpload, text: 'Upload file', iconClass: 'fa fa-upload'}];

        if (fileList.length > 1) {
            buttons.push({action: this.onOpenRemoveAll, text: 'Remove all', iconClass: 'fa fa-trash'});
        }

        var files = (<div className="d-flex h-100 w-100 justify-content-center align-items-center">
            <h3>No files loaded</h3>
        </div>);

        if (fileList.length > 0) {
            files = fileList.map(function (fileEntry) {
                var footer;
                let fileName = fileEntry.name
                if (fileEntry.isFolder) {
                    footer = <div className="row vertical-align">
                        <div className="flex-grow title">
                            <h6 className="m-0">{fileName}</h6>
                        </div>
                        <div className="ml-1">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={self.onOpenFolder(fileName)}
                            >
                                <span className="fa fa-folder-open"/>
                            </button>
                        </div>
                        <div className="ml-1">
                            <button className="btn btn-outline-secondary btn-sm"
                                    onClick={self.onOpenRemove(fileName)}>
                                <span className="fa fa-trash"/>
                            </button>
                        </div>
                    </div>
                } else if (self.state.oldFileName === fileName) {
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
                                    onClick={self.onOpenRemove(fileName)}>
                                <span className="fa fa-trash"/>
                            </button>
                        </div>
                    </div>
                }

                let icon_path = ""
                if (!fileEntry.isFolder)
                    icon_path = "./auth/assets/images/" + fileName.split('.').pop() + ".svg"
                else
                    icon_path = "./auth/assets/images/folder.svg"

                return (
                    <div className='col-md-12 col-lg-6 col-xl-3 mb-3 mt-3'>
                        <div className="card bg-light h-100 d-flex flex-grow">
                            <div
                                className="card-body p-0 flex-grow d-flex align-items-center justify-content-center ">
                                <div className="thumbnail m-bottom-0 border-0">
                                    <img src={icon_path}
                                         className="disable-events thumbnail-image" style={{height: "10vh"}}/>
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


        var fileUpload = this.state.showFileUpload ?
            <FileUpload onClose={this.onHideFileUpload} path={'./auth/uploadData'}/> :
            <div/>;

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";

        var removeConfirmation;
        if (this.state.showRemoveConfirmation) {
            var descMsg = self.state.removeAll ? 'All files will be removed.' : 'File "' + self.state.removeName + '", will be permanently removed.';
            removeConfirmation = (
                <ConfirmModal
                    onClose={this.onCloseRemove}
                    onConfirm={this.onRemove}
                    description={descMsg}
                    title={'File removal'}
                />
            );
        }

        return (
            <ContentContainer fadeClass={fadeClass}
                              fileUpload={fileUpload}
                              removeConfirmation={removeConfirmation}
                              buttons={buttons}
                              cards={files}
                              title={'Files'}
                              subtitle={'Data files'}
                              onShowDashboard={this.onShowDashboard}/>
        )
    }
});

function mapStateToProps(state) {
    return {
        files: state.ui.files,
    };
}

module.exports = connect(mapStateToProps)(Files);