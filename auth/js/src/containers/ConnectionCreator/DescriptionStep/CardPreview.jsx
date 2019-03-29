"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var structTypes = require('../../../constants/ConnectionStructTypes').types;
var CodePreview = require('./CodeTextEditor');
var beautify = require('js-beautify');
var VizPreview = React.createClass({

    render: function () {

        var jsonStructure = "structure";
        var objStructure = {};

        var add = function(obj,node, structure){
            switch (node.type){
                case structTypes.OBJECT:
                    obj[node.title] = {};
                    break;
                case structTypes.ARRAY:
                    obj[node.title] = [];
                    break;
                case structTypes.BOOL:
                    obj[node.title] = false;
                    break;
                case structTypes.NUMERIC:
                    obj[node.title] = 0;
                    break;
                case structTypes.STRING:
                    obj[node.title] = "";
                    break;
            }


            var newObj = obj[node.title];
            if(node.children.length>0 && node.type === structTypes.OBJECT)
                node.children.forEach(function (childId) {
                    add(newObj, structure[childId], structure);
                });
        };


        add(objStructure, this.props.structure[0], this.props.structure);
        jsonStructure = JSON.stringify(objStructure);
        jsonStructure = beautify(jsonStructure);

        return (
            <div className="col-6 pl-2 pt-3 pb-3 accordion-wrapper-preview">
                <div className="accordion-container" style={{height: "100%", display: "flex", flexFlow: "column"}}>
                    <div className='title open-dim d-flex justify-content-center'>
                        <h6 className="font-weight-bold pb-2 pt-2">Preview</h6>
                    </div>
                    <div style={{
                        backgroundColor: "#333",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1,
                        flexFlow: "column",
                        paddingBottom: "15px"
                    }} className="blueprint">
                        <div className='col-12' style={{display: "flex",
                            justifyContent: "center",
                            flexGrow: 1,
                            alignItems: "center",
                            flexFlow: "column"
                        }}>
                            <h5 style={{color: "#fff", fontWeight: "bold"}}>Internal property structure</h5>
                                <CodePreview code={jsonStructure}/>
                        </div>
                    </div>
                </div>
            </div>)
    }
});

function mapStateToProps(state) {
    return {
        structure: state.connectionCreatorSchema.structure
    };
}


module.exports = connect(mapStateToProps)(VizPreview);
