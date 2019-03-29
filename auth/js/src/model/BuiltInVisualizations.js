'use strict';

let React = require('react');
let Provider = require('react-redux').Provider;
let OptionsList = require('./../containers/Options/Options');

class Options {

    constructor() {

    }

    init(container, input, state, dataHandler, setProperty) {
        this.nodeDOM = container;
        React.render(
            React.createElement(Provider, {store: window.ReduxStore}, function () {
                    return React.createElement(OptionsList, {selectedCard: state.id, inPanel: true});
                }
            ), container);
    }

    update(container, input, state, dataHandler, setProperty){
        this.render(container, input, state, setProperty);
    }

    unMount(){
        React.unmountComponentAtNode(this.nodeDOM);
    }

}

module.exports = Options;
window.options = Options;

