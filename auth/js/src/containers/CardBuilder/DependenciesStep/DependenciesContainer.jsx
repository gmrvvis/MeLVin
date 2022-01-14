"use strict";

var React = require('react');
var FileLoader = require('../../FileUpload/FileUpload');
var DependenciesList = require('./DependenciesList');
var FileList = require('../../FileList/FileList');
module.exports = React.createClass({



    onOpenLeftBlock: function (index) {
        var self = this;
        return function () {
            if (self.props.config.openLeft === index) self.props.onChangeStepProp({openLeft: "none"});
            else self.props.onChangeStepProp({openLeft: index})
        }
    },

    onOpenRightBlock: function (index) {
        var self = this;
        return function () {
            if (self.props.config.openRight === index) self.props.onChangeStepProp({openRight: "none"});
            else self.props.onChangeStepProp({openRight: index})
        }
    },

    render: function () {
        var self = this;
        var leftComponents = [{title: "Upload dependencies", icon: "fa fa-upload", component: <FileLoader path={'./auth/uploadLib'}/>},
            {
                title: "Select dependencies", icon: "fa fa-book", component: <DependenciesList selectedValues={this.props.schema.selectedLibs}
                                                                  files={this.props.libFiles}
                                                                  listID={"lib"}
                                                                  onClick={this.props.onClick}
                                                                   onUpdateFileOption={this.props.onUpdateFileOption}
            />
            }];

        var rightComponents = [{title: "Upload preview", icon: "fa fa-upload", component: <FileLoader path={'./auth/uploadPreview'}/>},
            {
                title: "Select preview", icon: "fa fa-eye", component: <FileList selectedValue={this.props.schema.selectedPreview}
                                                                   files={this.props.previewFiles}
                                                                   listID={"preview"}
                                                                   onClick={this.props.onClick}/>
            }];


        return (
            <div className="container-content row wrap-cols">
                <div className="col-6 pr-2 accordion-wrapper overflow-y p-3">
                    {
                        leftComponents.map(function (obj, i) {
                            var containerClass = "accordion-container";
                            var titleClass = "title";
                            var content;
                            var cevhronClass = "fa fa-plus";
                            if (self.props.config.openLeft === i) {
                                containerClass = "accordion-container full flex-grow mh-0";
                                titleClass = "title open";
                                content = obj.component;
                                cevhronClass = "fa fa-minus";
                            }

                            return (
                                <div
                                    className={containerClass}>
                                    <div className={titleClass}>
                                        <h6><i className={"mr-2 fa-fw "+obj.icon}/>{obj.title}</h6>
                                        <button onClick={self.onOpenLeftBlock(i)} className="btn btn-empty">
                                            <span style={{cursor: "pointer"}} className={cevhronClass}/>
                                        </button>
                                    </div>
                                    {content}
                                </div>
                            )
                        })
                    }
                </div>
                <div className="col-6 pl-2 accordion-wrapper"
                     style={{overflowY: "auto", padding: "15px"}}>
                    {
                        rightComponents.map(function (obj, i) {
                            var containerClass = "accordion-container";
                            var titleClass = "title";
                            var content;
                            var cevhronClass = "fa fa-plus";
                            if (self.props.config.openRight === i) {
                                containerClass = "accordion-container full flex-grow mh-0";
                                titleClass = "title open";
                                content = obj.component;
                                cevhronClass = "fa fa-minus";
                            }

                            return (
                                <div
                                    className={containerClass}>
                                    <div className={titleClass}>
                                        <h6><i className={"mr-2 fa-fw "+obj.icon}/>{obj.title}</h6>
                                        <button onClick={self.onOpenRightBlock(i)} className="btn btn-empty">
                                            <span style={{cursor: "pointer"}} className={cevhronClass}/>
                                        </button>
                                    </div>
                                    {content}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
});
