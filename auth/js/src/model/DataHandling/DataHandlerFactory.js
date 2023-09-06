if (typeof importScripts === "function") {
    importScripts('../../js/src/model/DataHandling/DB.js');
    importScripts('../../js/src/model/DataHandling/DataHandler.js');
} else {
    var db = require("./DB.js");
}

class DataFactory {

    constructor(dbName, currentID, operationOpj) {
        //TODO: improve loading
        if (typeof importScripts !== "function")
            this.DataHandler = require('./DataHandler');
        else
            this.DataHandler = DataHandler;


        this.db = db;
        this.db.open();
        this.currentID = currentID;
        this.currentID = currentID;
        this.operationOpj = operationOpj;
        this.schemaOfEachSource = {};
        this.dataOfEachSource = {};
        this.initialFiles = {};
        this.initialSchema = {};
    }

    getSchema(datasetIndex) {
        datasetIndex = datasetIndex || 0;
        return this.schema[datasetIndex];
    }

    getAllSchema() {
        if (schema.length === 1)
            return this.schema[0];
        else
            return this.schema;
    }

    getData(datasetIndex) {
        datasetIndex = datasetIndex || 0;
        return this.data[datasetIndex];
    }

    getAllData() {
        if (data.length === 1)
            return this.data[0];
        else
            return this.data;
    }

    getInputsNum() {
        return this.data.length;
    }

    getDataHandler() {
        var self = this;

        var dataSources = this.operationOpj.dataSources;
        var changeSources = this.operationOpj.changeSources;


        return self.db.datasets.where("name").startsWithAnyOfIgnoreCase(dataSources).toArray().then(function (data) {
            var dataOfEachSource = {};
            dataSources.forEach(function (dataSourceName) {
                dataOfEachSource[dataSourceName] = [];
            });

            data.forEach(function (data) {
                dataOfEachSource[data.source] = dataOfEachSource[data.source].concat(data.dataset);//dataOfEachSource[data.source].concat(JSON.parse(data.dataset));
            });

            self.initialFiles = dataOfEachSource;

            return self.db.schemas.where("name").anyOfIgnoreCase(dataSources).toArray();
        }).then(function (schema) {
            var schemaOfEachSource = {};
            dataSources.forEach(function (dataSourceName) {
                schemaOfEachSource[dataSourceName] = [];
            });
            schema.forEach(function (schema) {
                schemaOfEachSource[schema.name] = schema.schema;
            });
            self.initialSchema = schemaOfEachSource;
            return self.db.changes.where("name").anyOfIgnoreCase(changeSources).toArray();
        }).then(function (changes) {
            var result = {data: [], schema: {}};
            if (changes.length > 0)
                result = self.applyDataChanges(changes);
            return Promise.resolve(result);
        }).then(function (result) {
            var dataHandler = new self.DataHandler(result.data, result.schema, self.storeChanges.bind(self));
            return Promise.resolve(dataHandler);
        });
    }

    getChanges() {
        var self = this;
        var changeSources = this.operationOpj.changeSources;

        return self.db.changes.where("name").anyOfIgnoreCase(changeSources).toArray().then(function (changes) {
            return Promise.resolve(changes);
        });
    }

    storeChanges(changes) {
        var self = this;
        return this.db.transaction('rw', this.db.changes, function* () {
            self.db.changes.put({name: "DataSource" + self.currentID, change: changes});
        }).catch(function (err) {
            console.error(err.stack || err);
        });
    }

    applyDataChanges(changes) {
        var self = this;

        var parsedChanges = {};
        changes.forEach(function (change) {
            parsedChanges[change.name] = change;
        });
        var data = [];
        var schema = [];
        this.operationOpj.operations.forEach(function (operation) {

            if (operation.type === "input") {
                data = [self.initialFiles["DataSource" + operation.id]];
                schema = [self.initialSchema["DataSource" + operation.id]];
            } else {
                data = operation.input.map(function (input) {
                    return self.dataOfEachSource["DataSource" + input][0];
                });

                schema = operation.input.map(function (input) {
                    return self.schemaOfEachSource["DataSource" + input][0];
                });
            }
            if (parsedChanges["DataSource" + operation.id])
                (parsedChanges["DataSource" + operation.id].change || []).forEach(function (change) {
                    switch (change.type) {
                        case "ADD_ROW":
                            self.addRow(data, schema, change.row, change.index);
                            break;
                        case "UPDATE_ROW":
                            self.updateRow(data, schema, change.rowIndex, change.row, change.index);
                            break;
                        case "REMOVE_ROW":
                            self.removeRow(data, schema, change.rowIndex, change.index);
                            break;
                        case "ADD_COLUMN":
                            self.addColumn(data, schema, change.columnName, change.column, change.attr, change.index);
                            break;
                        case "UPDATE_COLUMN":
                            self.updateColumn(data, schema, change.columnIndex, change.column, change.attr, change.index);
                            break;
                        case "REMOVE_COLUMN":
                            self.removeColumn(data, schema, change.columnIndex, change.index);
                            break;
                        case "DATA_MERGE":
                            self.mergeDataset(data, schema);
                            break;
                        case "ADD_DATASET":
                            self.addDataset(data, schema, change.dataset, change.schema);
                            break;
                        case "REMOVE_DATASET":
                            self.removeDataset(data, schema, change.index)
                    }
                });

            operation.remove.forEach(function (removeID) {
                self.dataOfEachSource["DataSource" + removeID] = undefined;
                self.schemaOfEachSource["DataSource" + removeID] = undefined;
                self.initialFiles["DataSource" + removeID] = undefined;
                self.initialSchema["DataSource" + removeID] = undefined;
            });

            self.dataOfEachSource["DataSource" + operation.id] = data;
            self.schemaOfEachSource["DataSource" + operation.id] = schema;
        });

        var result = {data: [], schema: []};
        this.operationOpj.input.forEach(function (inputObj) {
            result.data[inputObj.endIndex] = self.dataOfEachSource["DataSource" + inputObj.start][inputObj.startIndex || 0];
            result.schema[inputObj.endIndex] = self.schemaOfEachSource["DataSource" + inputObj.start][inputObj.startIndex || 0];
        });
        return result;
    }


    getRowIndex(data, originalIndex, datasetIndex) {
        datasetIndex = datasetIndex || 0;
        data = data[datasetIndex];
        if (Number.isInteger(originalIndex)) {
            if (originalIndex >= 0 && originalIndex < data.length)
                return originalIndex;
            else
                return -1;
        } else {
            let index = -1;
            for (let i = 0; i < data.length && index === -1; i++)
                if (data[i][0] === originalIndex)
                    index = i;
            return index;
        }
    }

    getColumnIndex(data, schema, originalIndex, datasetIndex) {
        datasetIndex = datasetIndex || 0;
        let schemaAux = schema[datasetIndex];
        if (Number.isInteger(originalIndex)) {
            if (originalIndex >= 0 && originalIndex < Object.keys(schemaAux.attributes).length)
                return originalIndex;
            else
                return -1;
        } else {
            return Object.keys(schemaAux.attributes).indexOf(originalIndex);
        }
    }

    addRow(data, schema, row, datasetIndex) {
        data[datasetIndex][data.length] = row;
    }

    updateRow(data, schema, rowIndex, row, datasetIndex) {
        rowIndex = this.getRowIndex(data, rowIndex, datasetIndex);
        data[datasetIndex][rowIndex] = row;

    }

    removeRow(data, schema, rowIndex, datasetIndex) {
        rowIndex = this.getRowIndex(data, rowIndex, datasetIndex);
        data[datasetIndex].splice(rowIndex, 1);
    }

    addColumn(data, schema, columnName, column, attr, datasetIndex) {
        var isCategorical = typeof column[0] === "string";
        var columnIndex = data[datasetIndex][0].length;
        if (isCategorical)
            data[datasetIndex] = data[datasetIndex].map(function (data, i) {
                data[columnIndex] = column[i];
                return data;
            });
        else
            data[datasetIndex] = data[datasetIndex].map(function (data, i) {
                data[columnIndex] = column[i];
                return data;
            });
        schema[datasetIndex].attributes[columnName] = attr;
    }

    updateColumn(data, schema, columnIndex, column, attr, datasetIndex) {
        columnIndex = this.getColumnIndex(data, schema, columnIndex, datasetIndex);

        var columnName = Object.keys(schema[datasetIndex].attributes).indexOf(columnIndex);
        var isCategorical = typeof column[i] === "string";

        if (isCategorical)
            data[datasetIndex] = data[datasetIndex].map(function (data, i) {
                data[columnIndex] = column[i];
                return data;
            });
        else
            data[datasetIndex] = data[datasetIndex].map(function (data, i) {
                data[columnIndex] = column[i];
                return data;
            });

        schema[datasetIndex].attributes[columnName] = attr;
    }

    removeColumn(data, schema, columnIndex, datasetIndex) {
        columnIndex = this.getColumnIndex(data, schema, columnIndex, datasetIndex);
        data[datasetIndex] = data[datasetIndex].map(function (data) {
            data.splice(columnIndex, 1);
            return data;
        });
        delete schema[datasetIndex].attributes[Object.keys(schema[datasetIndex].attributes)[columnIndex]];
    }

    mergeDataset(data, schema) {
        for (var i = 1; i < data.length; i++) {
            data[0] = data[0].concat(data[i]);
            delete data[i];
        }

        for (i = 1; i < schema.length; i++) {
            delete schema[i];
        }
    }

    addDataset(data, schema, dataset, datasetSchema) {
        data[data.length] = dataset;
        schema[schema.length] = datasetSchema;
    }

    removeDataset(data, schema, index) {
        if (index >= 0 && index < data.length) {
            data = data.splice(index, 1)
            schema = schema.splice(index, 1)
        }
    }

}

if (typeof WorkerGlobalScope === 'undefined' || !self instanceof WorkerGlobalScope) {
    module.exports = DataFactory;
}