importScripts('../../js/vendor/papaparse.min.js');
importScripts('../../js/src/model/DataHandling/DataHandlerFactory.js');


var setProgress = function (progress, info) {
    postMessage(JSON.stringify({
        type: "PROGRESS",
        progress: progress,
        info: info
    }))
};

var setResult = function (data) {
    data["schema"] = data.data.schema[0];
    var indexName = "DataSource" + currentID;


    dataHandler.db.transaction('rw', dataHandler.db.datasets, dataHandler.db.schemas, dataHandler.db.changes, function* () {
        dataHandler.db.datasets.where('name').startsWithIgnoreCase(indexName).delete();
        var i = 1;
        var maxBytes = 10 * 1024 * 1024;
        var maxChars = Math.floor(maxBytes / 2);
        var meanCharLength = JSON.stringify(data.data.data[0]).length * 4;
        var maxLines = Math.min(1000, data.data.data.length - 1); //Math.floor(maxChars/meanCharLength);
        var line = "[";
        while (i <= data.data.data.length) {
            line += JSON.stringify(data.data.data[i]);
            if (i % maxLines === 0) {
                line += "]";
                dataHandler.db.datasets.put({
                    name: indexName + "-" + Math.floor(i / maxLines), source: indexName,
                    dataset: line
                });
                line = "[";
            }
            else {
                line += ",";
            }
            ++i;
        }

        dataHandler.db.schemas.put({name: indexName, schema: data.data.schema});
        dataHandler.db.changes.put({name: indexName, change: []});
    }).then(function () {
        delete data.data.data;
        postMessage(JSON.stringify({
            type: "RESULT",
            data: data.data
        }))
    }).catch(function (err) {
        console.error(err.stack || err);
    });
};

function process(input, options, setResult, setProgress, dataTable) {
    var fileName = options.fileName;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../../files/" + fileName, true);

    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                setProgress(40, "Parsing " + fileName);
                var dataStructure = Papa.parse(xhr.response, {dynamicTyping: true, skipEmptyLines: true});
                setProgress(60, "Parsing " + fileName);
                var schemaAttr = dataStructure.data.shift();
                var schema = {attributes: {}};
                schema.attributes["unique_index"] = {attribute_type: "PKEY"};

                schemaAttr.forEach(function (attrName, i) {
                    var attr = {};
                    attr.name = attrName;
                    var isCategorical = isNaN(dataStructure.data[0][i]);

                    if (isCategorical) {
                        var uniqueValues = [];
                        dataStructure.data.forEach(function (data) {
                            if (uniqueValues.indexOf(data[i]) === -1) uniqueValues.push(data[i]);
                        });
                        attr.attribute_type = "CATEGORICAL";
                        attr.uniqueValues = uniqueValues;
                    }
                    else {
                        var min = dataStructure.data[0][i];
                        var max = dataStructure.data[0][i];
                        dataStructure.data.forEach(function (data) {
                            if (min > data[i]) min = data[i];
                            if (max < data[i]) max = data[i];
                        });
                        attr.attribute_type = "QUANTITATIVE";
                        attr.max = min;
                        attr.min = max;
                    }

                    schema.attributes[attrName] = attr;
                    setProgress(60 + (40 / schemaAttr.length * (i)), "Creating schema");
                });
                setProgress(99, "Wrapping up");

                var date = new Date();
                var currMili = date.getTime();


                dataStructure.data = dataStructure.data.map(function (data, i) {
                    data.unshift(currMili + "" + i)
                    return data;
                });

                setResult({"data": {"data": dataStructure.data, "schema": schema}});

            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.onprogress = function (e) {
        if (e.lengthComputable) {
            setProgress((e.loaded / e.total) * 40, "Loading " + fileName)
        }
    };
    xhr.send(null);
}

var input, options, currentID, dataHandler;

onmessage = function (message) {
    var parsedMessage = JSON.parse(message.data);
    switch (parsedMessage.type) {
        case "work":
            var self = this;
            input = parsedMessage.data.input;
            options = parsedMessage.data.state.options[0];
            currentID = parsedMessage.data.currentID;
            dataHandler = new DataFactory("database", currentID, {});
            self.process(input, options, setResult, setProgress);
            break;
    }
};