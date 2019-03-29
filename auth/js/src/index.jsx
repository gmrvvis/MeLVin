'use strict';
var React = require('react');
var App = require('./containers/mainApp');
var ReduxStore = require('./store/store');
var Provider = require('react-redux').Provider;
var workerSupervisor = require('./model/WorkerSupervisor');
var viewsPanel = require('./model/ViewsPanel');
var actionTypes = require('./actions/ActionTypes');
var dataSourceMapper = require('./model/DataSourceMapper');
window.ReduxStore = ReduxStore;

dataSourceMapper.init(ReduxStore);


workerSupervisor.setDispatch(ReduxStore.dispatch);
viewsPanel.setDispatch(ReduxStore.dispatch);
workerSupervisor.setViewsPanel(viewsPanel);
viewsPanel.setWorkerSupervisor(workerSupervisor);


$(window).resize(function () {
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function () {
        var newWidth = document.body.clientWidth;
        var newHeight = document.body.clientHeight;
        var currentWidth = ReduxStore.getState().ui.width;
        var currentHeight = ReduxStore.getState().ui.height;
        if (currentWidth !== newWidth || currentHeight !== newHeight)
            ReduxStore.dispatch({
                type: actionTypes.RESIZE_UI,
                width: newWidth,
                height: newHeight
            })
    }, 1000);
});


React.render(
    <Provider store={ReduxStore}>{
        function () {
            return <App/>
        }
    }
    </Provider>, document.getElementById('content')
);
