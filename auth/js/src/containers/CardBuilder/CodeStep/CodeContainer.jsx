"use strict";

var React = require('react');
var CodePreview = require('./CodePreview');
var ActionTypes = require('../../../actions/CardBuilderActionTypes');
var connect = require("react-redux").connect;
var CodeTextEditor = require("./CodeTextEditor");

var Code = React.createClass({

    getInitialState: function () {
        return {editingTitle: "none"}
    },

    onCodeChange: function (instance, changeObj) {
        this.props.dispatch({type: ActionTypes.MOD_METHOD_CODE, code: instance.getValue()})
    },

    componentDidMount: function () {
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })
    },

    render: function () {
        var self = this;
        return (
            <div className="container-content row wrap-cols mh-0">
                <div className="col-6 p-3 pr-2 accordion-wrapper h-100">
                    <div className="accordion-container h-100" style={{display: "flex", flexFlow: "column"}}>
                        <div className="title open-dim d-flex justify-content-center" style={{flex: "none"}}>
                            <h6 className="mb-0 font-weight-bold pb-2 pt-2">Code</h6>
                        </div>
                        <div className="d-flex justify-content-center flex-column flex-grow p-3 mh-0">
                            <div>
                                <label className="mb-0 font-weight-bold mr-1">Arguments</label>
                                {
                                    this.props.args.map(function (argObj) {
                                        return <span className={"ml-2 badge badge-secondary"}>{argObj.name}</span>
                                    })
                                }
                            </div>
                            <div className="d-flex flex-column flex-grow mh-0">
                                <label
                                    className="mb-0 font-weight-bold">Code</label>
                                <CodeTextEditor onChange={self.onCodeChange}
                                                code={this.props.code} mode={this.props.mode}/>
                            </div>
                        </div>
                    </div>
                </div>
                <CodePreview/>
            </div>
        )
    }
});


function mapStateToProps(state) {
    return {
        code: state.cardCreatorSchema.schema.method.code,
        args: state.cardCreatorSchema.schema.method.args,
        mode: state.cardCreatorSchema.schema.type
    };
}


module.exports = connect(mapStateToProps)(Code);
