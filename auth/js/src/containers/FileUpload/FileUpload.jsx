"use strict";

var React = require('react');

module.exports = React.createClass({

    getFormttedSize: function (size) {
        var units = ["bytes", "KB", "MB", "GB", "TB"];
        var unitIndex = 0;
        while (size > 1024) {
            size /= 1024;
            unitIndex++;
        }
        var splitNumber = (size + '').split('.');
        var fractionalPart = (splitNumber.pop() + '').substring(0, 2);
        var integerPart = splitNumber.pop();

        return integerPart + '.' + fractionalPart + ' ' + units[unitIndex];
    },

    getInitialState: function () {
        return {files: [], uploading: false, uploadDone: false, uploadFailed: false};
    },

    selectDataFiles: function () {
        React.findDOMNode(this.refs.submitData).click();
    },

    onAddFiles: function () {
        var files = React.findDOMNode(this.refs.submitData).files;
        var filesArray = [];
        for (var i = 0; i < files.length; i++) {
            filesArray.push(files[i])
        }
        this.setState({files: this.state.files.concat(filesArray)})
    },

    onRemoveFile: function (index) {
        var self = this;
        return function () {
            self.state.files.splice(index, 1);
            self.setState({files: self.state.files, uploadDone: false})
        }
    },

    onUploadFile: function () {
        var self = this;
        this.setState({uploading: true});
        var formData = new FormData();
        this.state.files.forEach(function (file) {
            formData.append('files', file, file.name)
        });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.props.path, true);
        xhr.onload = function () {
            self.props.onSuccess();
        };
        xhr.onerror = function () {
            self.setState({uploading: false, files: [], uploadDone: true, uploadFailed: true});
        };
        xhr.send(formData);
    },

    render: function () {
        var self = this;
        var fileList = (
            <div className="alert alert-info text-center">
                No files selected yet, use the above button to select some.
            </div>
        );

        if (this.state.uploadDone && !this.state.uploadFailed) {
            fileList = (
                <div className="alert alert-success text-center">
                    Upload sucessfull.
                </div>
            )
        }

        if (this.state.uploadDone && this.state.uploadFailed) {
            fileList = (
                <div className="alert alert-danger text-center">
                    Upload failed, please try again later.
                </div>
            )
        }

        if (this.state.files.length > 0)
            fileList = (
                this.state.files.map(function (file, i) {
                    return (
                        <div className="col-12 file-list-item"
                             style={{display: "flex", flexFlow: "row", alignItems: "center"}}>
                            <div>
                                <span className="glyphicon glyphicon glyphicon-list-alt" style={{fontSize: "20px"}}/>
                            </div>
                            <div style={{flexGrow: 1, margin: "0 15px"}}>
                                <div style={{display: "flex", flexFlow: "column"}}>
                                    <span style={{
                                        marginBottom: "0px",
                                        fontWeight: "bold",
                                        wordWrap: "break-word"
                                    }}>{file.name}</span>
                                    <span style={{
                                        marginTop: "0px",
                                        color: "#595959",
                                        wordWrap: "break-word"
                                    }}>{self.getFormttedSize(file.size)}</span>
                                </div>
                            </div>
                            <div>
                                <button className="btn btn-danger btn-sm btn-remove-empty"
                                        onClick={self.onRemoveFile(i)}><span
                                    className="fa fa-times"/></button>
                            </div>
                        </div>
                    )
                })
            );


        return (
            <div className="file-upload" style={{flexGrow: 1}}>
                <form style={{"display": "none"}} action={this.props.path} ref="formData"
                      encType="multipart/form-data" method="POST">
                    <input type="file" ref="submitData" name="files" multiple onChange={this.onAddFiles}/>
                </form>
                <div className="col-12 drop-zone">
                    {/*<span>DROP FILES HERE</span>*/}
                    {/*<span>or</span>*/}
                    <button className="btn btn-primary" style={{alignSelf: "center"}}
                            onClick={this.selectDataFiles}><span
                        className="fa fa-folder-open"/>{" Select files"}
                    </button>
                </div>
                <div className="file-list">
                    {fileList}
                </div>
                <div className="footer">
                    <button className="btn btn-success" style={{alignSelf: "flex-end"}}
                            onClick={this.onUploadFile} ref="uploadButtonText"><span
                        className="fa fa-cloud-upload-alt"/>{
                        this.state.uploading ? " Uploading..." : " Upload files"
                    }
                    </button>
                </div>
            </div>
        )
    }
});