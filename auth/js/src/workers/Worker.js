importScripts('../../js/src/model/DataHandling/DataHandlerFactory.js');

var setProgress = function (progress, info) {
    postMessage(JSON.stringify({
        type: "PROGRESS",
        progress: progress,
        info: info
    }))
};

var setResult = function (data) {
    dataFactory.storeChanges(gdataHandler.changes).then(function () {
            postMessage(JSON.stringify({
                type: "RESULT",
                data: data
            }));
        }
    );
};

var input, state, operationList, dataFactory, currentID, gdataHandler;

onmessage = function (message) {
    var parsedMessage = JSON.parse(message.data);
    switch (parsedMessage.type) {
        case "work":
            var self = this;
            operationList = parsedMessage.data.operationList;
            currentID = parsedMessage.data.currentID;
            dataFactory = new DataFactory("database", currentID, operationList);


            importScripts("./" + parsedMessage.data.workerPath.split('/').pop());

            dataFactory.getDataHandler().then(function (dataHandler) {
                parsedMessage.data.state["dataHandler"] = dataHandler;
                gdataHandler = dataHandler;
                self.process(parsedMessage.data.input, parsedMessage.data.state, dataHandler, setResult, setProgress);
            });
            break;
    }
};