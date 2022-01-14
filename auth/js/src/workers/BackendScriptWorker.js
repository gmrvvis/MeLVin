importScripts('../../js/src/model/DataHandling/DataHandlerFactory.js');
importScripts('../../js/vendor/socket.io.js');
var socket = io(location.hostname, {path: '/auth/wSocket', transports: ['websocket']});

socket.on('Work.done', function (jobId) {
    xhrGetRequest('../../jobs/' + jobId).then(function (response) {
        console.log("Work completed");
        response = JSON.parse(response);
        dataFactory.storeChanges(response.changes);
        setResult(response.state);
    });
});


socket.on('Work.failed', function (jobId) {
    console.log("Work failed");
    setResult();
});


var setProgress = function (progress, info) {
    postMessage(JSON.stringify({
        type: "PROGRESS",
        progress: progress,
        info: info
    }))
};

var setResult = function (data) {
    postMessage(JSON.stringify({
        type: "RESULT",
        data: data
    }))
};

var xhrRequest = function (verb, url, content) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(verb, url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300)
                resolve(xhr.getResponseHeader("location"));
            else
                reject({status: this.status, statusText: xhr.statusText});

        };
        xhr.onerror = function () {
            reject({status: this.status, statusText: xhr.statusText});
        };
        xhr.send(content);
    });
};


var xhrGetRequest = function (url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300)
                resolve(xhr.responseText);
            else
                reject({status: this.status, statusText: xhr.statusText});

        };
        xhr.onerror = function () {
            reject({status: this.status, statusText: xhr.statusText});
        };
        xhr.send(null);
    });
};

function process(changes, state, operationList, setResult, setProgress) {
    setProgress(1, "Creating task");
    xhrRequest('POST', '../../jobs', null).then(function (jobLocation) {
        var contentPromises = [];
        var changeChain = Promise.resolve();
        contentPromises.push(Promise.resolve(jobLocation));
        contentPromises.push(xhrRequest('POST', jobLocation + '/operationList', JSON.stringify(operationList)));
        contentPromises.push(xhrRequest('POST', jobLocation + '/state', JSON.stringify(state)));
        contentPromises.push(xhrRequest('POST', jobLocation + '/input', JSON.stringify(state)));
        changes.forEach(function (change, i) {
            changeChain = changeChain.then(function () {
                return xhrRequest('POST', jobLocation + '/changes', JSON.stringify({
                    id: i,
                    content: JSON.stringify(change)
                }));
            });
        });
        contentPromises.push(changeChain);

        setProgress(20, "Sending changes");
        return Promise.all(contentPromises);
    }).then(function (results) {
        socket.emit('Work.start', results[0])
    }).catch(function (err) {
        console.log("Failed to start job: " + err.message)
    });
}

function processData(dataHandler, input, state, operationList, setResult, setProgress, type) {
    setProgress(1, "Creating task");
    xhrRequest('POST', '../../jobs?id=' + state.type, null).then(function (jobLocation) {
        var contentPromises = [];
        var dataObj = {};
        dataHandler.data.map(function (data, i) {
            dataObj["data" + i] = data;
        });

        var schemaObj = {};
        dataHandler.schema.map(function (schema, i) {
            schemaObj["schema" + i] = schema.attributes;
        });

        contentPromises.push(Promise.resolve(jobLocation));
        contentPromises.push(xhrRequest('POST', jobLocation + '/operationList', JSON.stringify(operationList)));
        contentPromises.push(xhrRequest('POST', jobLocation + '/data', JSON.stringify(dataObj)));
        contentPromises.push(xhrRequest('POST', jobLocation + '/schema', JSON.stringify(schemaObj)));
        contentPromises.push(xhrRequest('POST', jobLocation + '/state', JSON.stringify(state)));
        contentPromises.push(xhrRequest('POST', jobLocation + '/input', JSON.stringify(input)));
        setProgress(20, "Sending changes");
        return Promise.all(contentPromises);
    }).then(function (results) {
        socket.emit('Work.start', {"id": results[0], "type": type})
    }).catch(function (err) {
        console.log("Failed to start job: " + err.message)
    });
}

var operationList, dataFactory, currentID;

onmessage = function (message) {
    var parsedMessage = JSON.parse(message.data);
    switch (parsedMessage.type) {
        case "work":
            var self = this;
            operationList = parsedMessage.data.operationList;
            currentID = parsedMessage.data.currentID;
            dataFactory = new DataFactory("database", currentID, operationList);
            dataFactory.getDataHandler().then(function (dataHandler) {
                self.processData(dataHandler, parsedMessage.data.input, parsedMessage.data.state, operationList, setResult, setProgress, parsedMessage.data.type);
            });
            break;

    }
};