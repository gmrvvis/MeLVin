"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var vizParams = require('../../constants/CardsSchema');
var beautify = require('js-beautify').js_beautify;
var ConnectionTypes = require('./../../constants/ConnectionTypes');
var dataSourceMapper = require('../../model/DataSourceMapper');

var GrammarEditor = React.createClass({

    getInitialState: function () {
        return {error: {}, showError: false}
    },

    onCloseModal: function () {
        this.props.dispatch({type: ActionTypes.HIDE_GRAMMAR_EDITOR});
    },

    onSaveGrammar: function () {
        this.props.dispatch({type: ActionTypes.SAVE_GRAMMAR, grammar: this.grammar});
        this.props.dispatch({type: ActionTypes.HIDE_GRAMMAR_EDITOR});
    },

    onGrammarEdit: function () {
        var self = this;
        return function (instance, changeObj) {
            self.grammar = instance.getValue();
        };
    },

    componentDidMount: function () {
        this.cm = CodeMirror(this.refs.renderCode, {
            value: this.grammar,
            mode: "javascript",
            lineNumbers: true,
            foldGutter: true,
            lineWrapping: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        this.cm.getWrapperElement().style.fontSize = '14 px';
        this.cm.on('change', this.onGrammarEdit())
    },

    onFontIncrease: function () {
        this.cm.getWrapperElement().style.fontSize =
            (parseInt(this.cm.getWrapperElement().style.fontSize.split('px').join('')) + 1) + "px";
        this.cm.refresh();
    },

    onFontDecrease: function () {
        var fontSize = parseInt(this.cm.getWrapperElement().style.fontSize.split('px').join(''));
        if (fontSize > 0) {
            this.cm.getWrapperElement().style.fontSize = (fontSize - 1) + "px";
            this.cm.refresh();
        }
    },

    onApplyGrammar: function () {
        var result = dataSourceMapper.importDFD(this.grammar);
        if (result.errors) {
            this.setState({error: result.errors, showError: !result.isValidGrammar});
        }
        else {
            this.props.dispatch({type: ActionTypes.HIDE_VIZ});
            this.props.dispatch({type: ActionTypes.HIDE_VIZ_PANEL});
            this.props.dispatch({type: ActionTypes.HIDE_GRAMMAR_EDITOR});
            this.props.dispatch({type: ActionTypes.SELECT_NAVBAR_INDEX, index: "blueprint"});
        }

    },

    onFormat: function () {
        try {
            var parsedGrammar = JSON.parse(this.grammar);
            this.cm.setValue(JSON.stringify(parsedGrammar, null, 4));
            delete this.state.error.JSON;
            this.setState({error: this.state.error, showError: Object.keys(this.state.error).length > 0})
        } catch (e) {
            this.state.error.JSON = e.message;
            this.setState({error: this.state.error, showError: true})
        }
    },


    render: function () {
        var self = this;

        var code = dataSourceMapper.exportDFD();

        var errorMsg = <div></div>;
        if (this.state.showError) {

            var errors = [];
            Object.keys(this.state.error).forEach(function (errorKey) {
                if (typeof self.state.error[errorKey] === "string")
                    errors.push(
                        <li>{self.state.error[errorKey]}</li>
                    );
                else
                    self.state.error[errorKey].forEach(function (error) {
                        errors.push(<li>{error}</li>)
                    });
            });


            errorMsg = <div className="alert alert-danger">
                <ul>
                    {errors}
                </ul>
            </div>
        }

        this.grammar = JSON.stringify(code, null, 2);
        if (this.props.showGrammarEditor)
            return (
                <div className="grammar-window">
                    {errorMsg}
                    <div className="grammar-buttons">
                        <div className="d-flex">
                            <button className="grammar-button" onClick={this.onFontDecrease}>
                                <i className="fa fa-font"/>
                                <i className="fa fa-minus fa-xs up"/>
                            </button>

                            <button className="grammar-button" onClick={this.onFontIncrease}>
                                <i className="fa fa-font"/>
                                <i className="fa fa-plus fa-xs up"/>
                            </button>

                            <button className="grammar-button" onClick={this.onFormat}>
                                <i className="fa fa-indent"/>
                            </button>
                        </div>
                        <button className="grammar-button save" onClick={this.onApplyGrammar}>
                            <i className="fa fa-check"/>
                        </button>
                    </div>
                    <div className="grammar-code">
                        <div ref="renderCode" className="h-100 w-100"/>
                    </div>
                </div>
            );
        else
            return (<div/>)
    }
});

function mapStateToProps(state) {
    return {
        showGrammarEditor: state.grammar.showGrammarEditor,
        cards: state.cards,
        connections: state.connections,
        options: state.options,
        panels: state.panels,
        layouts: state.layouts,
        layers: state.layers
    };
}


module.exports = connect(mapStateToProps)(GrammarEditor);
