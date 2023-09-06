'use strict';

var React = require('react');
var connect = require("react-redux").connect;
var DataInput = React.createClass({

    getInitialState: function () {
        let state = {
            folderName: "-1",
            fileName: "-1",
            loadedFileName: "no file loaded yet",
            restrictFileSelection: false,
            editingId: false,
            id: "not set"
        };
        let option = (this.props.alternateOptions || this.props.options[this.props.selectedCard]);
        if (option[0] && Object.keys(option[0]).length === 0) {
            state.fileName = option[0].fileName
            state.folderName = option[0].folderName
            state.loadedFileName = option[0].loadedFileName
        }

        return state
    },

    onChangeId: function (event) {
        this.setState({id: event.target.value});
    },

    onEditId: function () {
        this.setState({editingId: true, oldId: this.state.id})
    },

    onCancelEditId: function () {
        this.setState({editingId: false, id: this.state.oldId})
    },

    onSaveEditId: function () {
        var newState = Object.assign({}, this.state, {editingId: false});
        this.setState(newState);
        this.props.saveInternalState(newState);
    },

    onFileChange: function (event) {
        this.setState({fileName: event.target.value});
    },

    onFolderChange: function (event) {
        this.setState({folderName: event.target.value});
    },

    _onCheckFileSelection: function (event) {
        this.setState({restrictFileSelection: !event.currentTarget.childNodes[0].checked});
    },

    render: function () {
        let folders = Object.assign({root: {name: "root", isFolder: true, files: this.props.system.files.files}},
            this.props.system.files.folders)
        var card = this.props.cards.byId[this.props.selectedCard];
        var inPanel = this.props.inPanel;
        let folderList = Object.keys(this.props.system.files.folders);
        var folderOptions = ["Choose a folder", "root"].concat(folderList);
        var folderValues = ["-1", "root"].concat(folderList);
        var defaultFolder = this.state.folderName;
        var defaultFile = this.state.fileName;
        var fileOptions;
        var fileValues;

        var self = this;
        var selectFileData;
        var selectFolderData;
        var loadBtn;

        if (this.state.folderName && this.state.folderName !== "-1") {
            let fileList = Object.keys(folders[this.state.folderName].files)
            fileOptions = ["Choose a file"].concat(fileList)
            fileValues = ["-1"].concat(fileList)
        } else {
            fileOptions = ["Choose a folder first"]
            fileValues = ["-1"]
        }


        // if (!inPanel || (inPanel && !this.state.restrictFileSelection)) {
        if (fileOptions.length === 0) {
            selectFileData = <input type="text" value="No data files on the server" disabled="disabled"/>;
        } else {
            selectFolderData =
                (
                    <div className="mb-3">
                        <div className="input-group">
                            <select key={this.props.selectedCard + "Folder"} className="custom-select"
                                    onChange={this.onFolderChange}
                                    defaultValue={defaultFolder}>
                                {folderOptions.map(function (option, i) {
                                    return (
                                        <option id={"id" + i} value={folderValues[i]}>{option}</option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                )
            selectFileData =
                (
                    <div className="mb-3">
                        <div className="input-group">
                            <select key={this.props.selectedCard + "File"} className="custom-select"
                                    onChange={this.onFileChange}
                                    defaultValue={defaultFile}>
                                {fileOptions.map(function (option, i) {
                                    return (
                                        <option id={"id" + i} value={fileValues[i]}>{option}</option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                )
            loadBtn = (
                <div className="mb-3">
                    <button className="btn btn-outline-primary w-100" type="button"
                            disabled={this.state.folderName === "-1" || this.state.fileName === "-1"}
                            onClick={function () {
                                let state = Object.assign({loadedFileName: self.state.fileName}, self.state)
                                self.props.saveInternalState(state);
                                self.props.startWork([state]);
                                self.setState({loadedFileName: self.state.fileName})
                            }}>
                        <i className="fa fa-download mr-1"></i>
                        Load data
                    </button>
                </div>
            )
        }
        // } else {
        //     selectFileData = (
        //         <div>
        //             <div className="input-group">
        //                 <input type="text" className="form-control" disabled value={this.state.fileName}/>
        //                 <div className="input-group-append">
        //                     <button className="btn btn-outline-primary" type="button"
        //                             disabled={card.processing}
        //                             onClick={function () {
        //                                 self.props.saveInternalState(self.state);
        //                                 self.props.startWork([self.state]);
        //                                 self.setState({loadedFileName: self.state.fileName})
        //                             }}>
        //                         <i className="fa fa-download"/>
        //                     </button>
        //                 </div>
        //             </div>
        //         </div>
        //     );
        // }

        // var restrictCheckBox;
        // if (!inPanel) {
        //     restrictCheckBox = (
        //         <div className="custom-control custom-checkbox mb-3" onClick={this._onCheckFileSelection}>
        //             <input type="checkbox" className="custom-control-input" checked={this.state.restrictFileSelection}/>
        //             <label className="custom-control-label">
        //                 Only allow the below file to be loaded from visualization panels
        //             </label>
        //         </div>
        //     );
        // }
        var footer;

        if (card.processing) {
            footer = (
                <div className="progress mt-3" style={{height: "35px"}}>
                    <div className="progress-bar"
                         style={{width: card.progress.progress + "%"}}>
                        {Math.floor(card.progress.progress) + "%"}
                    </div>
                </div>
            )
        }

        var identifier = (
            <div className="d-flex align-items-center pb-2">
                <label className="col-form-label pt-0 pb-0 mr-2">
                    <span className="font-bold">Identifier: </span>
                </label>
                <label className="col-form-label text-muted pt-0 pb-0">
                    <span className="font-bold">{(this.state.id || 'Not set')}</span>
                </label>
                <button className="btn btn-light btn-sm text-muted btn-empty" onClick={this.onEditId}>
                    <i className="fa fa-pen"/>
                </button>
            </div>
        );

        if (this.state.editingId) {
            var value = (this.state.id || '');
            identifier = (
                <div className="input-group pl-2">
                    <input type="text"
                           className="form-control"
                           spellCheck="false" defaultValue={value}
                           onChange={this.onChangeId}/>
                    <div className="input-group-append">
                        <button key="0"
                                type="button"
                                className="btn btn-outline-success"
                                onClick={this.onSaveEditId}>
                            <span className="fa fa-check-circle"/>
                        </button>
                        <button key="1"
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={this.onCancelEditId}>
                            <span className="fa fa-times-circle"/>
                        </button>
                    </div>
                </div>
            );
        }
        var table;

        if (card.schema && card.schema.attributes && !card.processing) {
            table = (
                <table className="table">
                    <thead className="thead-dark">
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Type</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        Object.keys(card.schema.attributes).map(function (attrKey, i) {
                            return (
                                <tr>
                                    <th scope="row">{i}</th>
                                    <td>{card.schema.attributes[attrKey].name}</td>
                                    <td>{card.schema.attributes[attrKey].attribute_type}</td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>
            )
        } else {
            table = (
                <div className="col-12 d-flex align-items-center justify-content-center">
                    <div className="alert alert-info">
                        <h5 className="text-center">Currently, no data is loaded. Use the above dropdown to load data
                            from a file.</h5>
                    </div>
                </div>)
        }

        var currentData;
        if (card.schema && card.schema.attributes && !card.processing)
            currentData = <p> Currently loaded file: <strong>{this.state.loadedFileName}</strong></p>
        else if (!card.processing)
            currentData = <p> Last loaded file: <strong>{this.state.loadedFileName}</strong></p>

        return (
            <div className="col">
                {identifier}
                {selectFolderData}
                {selectFileData}
                {loadBtn}
                {/*{restrictCheckBox}*/}
                {footer}
                {currentData}
                {table}
            </div>
        )
    }
});


function mapStateToProps(state) {
    return {
        username: state.ui.username,
        system: {files: state.ui.files},
        options: state.options,
        cards: state.cards
    };
}

module.exports = connect(mapStateToProps)(DataInput);