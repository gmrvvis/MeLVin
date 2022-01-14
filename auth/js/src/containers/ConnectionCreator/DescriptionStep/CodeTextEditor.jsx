"use strict";

var React = require('react');

module.exports = React.createClass({

    componentDidMount: function () {
        $(this.refs.renderCode.getDOMNode()).empty();

        CodeMirror(this.refs.renderCode.getDOMNode(), {
            value: this.props.code,
            mode: "javascript",
            readOnly: 'nocursor',
            lineNumbers: true,
            gutters: ["CodeMirror-lint-markers"],
        });

    },

    componentDidUpdate: function () {
        $(this.refs.renderCode.getDOMNode()).empty();
        CodeMirror(this.refs.renderCode.getDOMNode(), {
            value: this.props.code,
            mode: "javascript",
            readOnly: 'nocursor',
            lineNumbers: true,
            gutters: ["CodeMirror-lint-markers"],
        });

    },

    render: function () {
        return (
            <div ref="renderCode" style={{
                border: "1px solid #dddddd",
                flexGrow: 1,
                backgroundColor: "white",
                width: "100%",
                borderRadius: "4px",
                overflow: "auto",
                minHeight: "0px"
            }}/>
        )
    }
});