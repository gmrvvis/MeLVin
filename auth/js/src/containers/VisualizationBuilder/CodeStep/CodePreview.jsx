"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var beautify = require('js-beautify').js_beautify;

var CodePreview = React.createClass({

    componentDidMount: function () {
        var domNode = this.refs.code.getDOMNode();
        this.cm = CodeMirror(domNode, {
            value: this.generateCode(),
            mode: "javascript",
            lineNumbers: true,
            readOnly: 'nocursor',
            gutters: ["CodeMirror-lint-markers"],
            lint: true
        });
        this.cm.setValue(this.generateCode());
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        var scrolInfo = this.cm.getScrollInfo();
        this.cm.setValue(this.generateCode(nextProps));
        this.cm.scrollTo(scrolInfo.left, scrolInfo.top);
        return false;
    },

    generateCode: function (nextProps) {
        var props = nextProps || this.props;
        var tmp = this.codeTemplate.substring(0, this.codeTemplate.length);
        tmp = tmp.split('#name#').join(props.schema.className);
        var methods = [];
        Object.keys(props.schema.methods).forEach(function (methodName) {
            var method = methodName + "(#arg#) {";
            method = method.replace("#arg#", props.schema.methods[methodName].args);
            method = method + "\n" +  props.schema.methods[methodName].code + "\n }";
            methods.push(method);
        });

        tmp = tmp.split("#methods#").join(methods.join('\n\n'));
        return beautify(tmp, { indent_size: 2 });
    },

    render: function () {
        this.codeTemplate = decodeURI("class%20#name#%20%7B%0A%0A%20%20%20%20constructor()%20%7B%0A%20%7D%0A%0A#methods#%0A%7D%0A%0Awindow.#name#%20=%20#name#;%0A");
        return (
            <div className="col-6 pl-2 pt-3 pb-3 accordion-wrapper-preview h-100"
                 style={{padding: "15px"}}>
                <div className="accordion-container d-flex flex-column flex-grow h-100">
                    <div className='title open-dim d-flex justify-content-center'>
                        <h6 className="mb-0 font-weight-bold pb-2 pt-2">Preview</h6>
                    </div>
                    <div ref="code" style={{borderBottom: "1px solid #dddddd", height: "100%", overflowY:"auto", paddingTop: 0}}/>
                </div>
            </div>)
    }
});

function mapStateToProps(state) {
    return {
        schema: state.visualizationCreatorSchema.schema
    };
}


module.exports = connect(mapStateToProps)(CodePreview);
