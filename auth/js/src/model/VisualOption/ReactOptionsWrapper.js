'use strict';

let React = require('react');
let Provider = require('react-redux').Provider;
let Options = require('./../../containers/Options/Options');
//TODO: remove global redux store
class ReactOptionsWrapper {

    constructor(nodeDOM, cardId) {
        this.nodeDOM = nodeDOM;
        this.cardId = cardId;
    }

    render() {
        let self = this;
        React.render(
            React.createElement(Provider, {store: window.ReduxStore}, function () {
                    return React.createElement(Options, {selectedCard: self.cardId, inPanel: true});
                }
            ), this.nodeDOM[0]);
    }

    unMount() {
        React.unmountComponentAtNode(this.nodeDOM[0]);
    }

}

module.exports = ReactOptionsWrapper;