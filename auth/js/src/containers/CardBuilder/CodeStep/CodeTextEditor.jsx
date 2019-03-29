"use strict";

var React = require('react');

module.exports = React.createClass({

    shouldComponentUpdate: function () {
        return true;
    },

    componentDidMount: function () {
        var cm = CodeMirror(this.refs.renderCode.getDOMNode(), {
            value: this.props.code,
            mode: this.props.mode || "javascript" ,
            lineNumbers: true,
            gutters: ["CodeMirror-lint-markers"],
            lint: true
        });

        cm.on('change',this.props.onChange)
    },

    render: function () {
        return (
            <div ref="renderCode" style={{border: "1px solid #dddddd", height: "100%", overflowY:"auto"}}/>
        )
    }
});