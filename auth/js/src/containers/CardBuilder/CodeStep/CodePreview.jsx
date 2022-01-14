"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var beautify = require('js-beautify').js_beautify;

var CodePreview = React.createClass({

    componentDidMount: function () {
        var domNode = this.refs.code.getDOMNode();
        this.cm = CodeMirror(domNode, {
            value: this.generateCode(),
            mode: this.props.mode,
            lineNumbers: true,
            readOnly: true,
            gutters: ["CodeMirror-lint-markers"],
            lint: this.props.mode === "javascript"
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
        var tmp = this.codeTemplate[this.props.mode].substring(0, this.codeTemplate[this.props.mode].length);
        tmp = tmp.split('#code#').join(props.code);
        return beautify(tmp, {indent_size: 2});
    },

    render: function () {
        this.codeTemplate = {
            javascript: decodeURI("function%20process(input,%20state,%20dataHandler,%20setResult,%20setProgress)%20%7B%0A%20%20var%20options%20=%20state.options;%0A%0A%20%20#code#%0A%7D%0A"),
            r: decodeURI("process%20%3C-%20function(input,%20state,%20dataHandler,%20setResult,%20setProgress)%20%7B%0A%20%20%20%20#code#%0A%20%20%20%20setResult(state)%0A%7D%0A"),
            python: decodeURI("def%20process(input,%20state,%20dataHandler,%20setResult,%20setProgress):%20%0A%20%20%20%20#code#%0A%20%20%20%20setResult(state)%0A%0A")
        };
        return (
            <div className="col-6 pl-2 pt-3 pb-3 accordion-wrapper-preview h-100 p-3">
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
        code: state.cardCreatorSchema.schema.method.code,
        mode: state.cardCreatorSchema.schema.runOn
    };
}


module.exports = connect(mapStateToProps)(CodePreview);
