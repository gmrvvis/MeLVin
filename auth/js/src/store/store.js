var Redux = require('redux');
var middleware = require('../middleware/middleware');
var rootReducer = require('../reducers/root');

var initialState = {};

module.exports = Redux.createStore(rootReducer, initialState, Redux.applyMiddleware(middleware));