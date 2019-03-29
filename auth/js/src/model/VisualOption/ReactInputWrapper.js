'use strict';

let React = require('react');
let Provider = require('react-redux').Provider;
//TODO: remove global redux store
class Input {

    constructor(nodeDOM, component, options) {
        this.component = component;
        this.options = options;
        this.nodeDOM = nodeDOM;

    }

    render() {
        var self = this;
        React.render(
            React.createElement(Provider, {store: window.ReduxStore}, function () {
                    return React.createElement(self.component, self.options);
                }
            ), this.nodeDOM[0]);
    }

    update() {
        var self = this;
        React.render(
            React.createElement(Provider, {store: window.ReduxStore}, function () {
                    return React.createElement(self.component, self.options);
                }
            ), this.nodeDOM[0]);
    }


}

module.exports = Input;