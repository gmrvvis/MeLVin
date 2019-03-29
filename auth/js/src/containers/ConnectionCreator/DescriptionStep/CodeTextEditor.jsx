"use strict";

var React = require('react');

module.exports = React.createClass({

    componentDidMount: function () {
        $(this.refs.renderCode.getDOMNode()).empty();

        CodeMirror(this.refs.renderCode.getDOMNode(), {
            value: this.props.code,
            mode: "javascript",
            readOnly: 'nocursor'
        });

    },

    componentDidUpdate: function () {
        $(this.refs.renderCode.getDOMNode()).empty();
        CodeMirror(this.refs.renderCode.getDOMNode(), {
            value: this.props.code,
            mode: "javascript",
            readOnly: 'nocursor'
        });

    },

    render: function () {
        return (
            <div ref="renderCode" style={{
                border: "1px solid #dddddd",
                flexGrow: 1,
                backgroundColor: "white",
                width: "100%",
                borderRadius: "4px"
            }} className="full-height"/>
        )
    }
});