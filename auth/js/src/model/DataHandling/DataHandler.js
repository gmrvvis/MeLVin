class DataHandler {

    constructor(data, schema, saveChanges) {
        this.data = data;
        this.schema = schema;
        this.changes = [];
        this.saveChangesCallback = saveChanges;
    }

    getDataAsObject(datasetIndex){
        datasetIndex = datasetIndex || 0;
        let currentData = this.data[datasetIndex];
        let currentSchema = this.schema[datasetIndex];

        let dataObjectTemplate = Object.keys(currentSchema.attributes).reduce(function (finalObject, key) {
            finalObject[key] = "";
            return finalObject
        }, {});

        return currentData.map(function (dataEntry) {
            let currentDataEntry = Object.assign({}, dataObjectTemplate);
            Object.keys(currentSchema.attributes).forEach(function (key, i) {
                currentDataEntry[key] = dataEntry[i];
            });
            return currentDataEntry;
        })
    }

    removeChanges(){
        this.changes = [];
    }

    getSchema(datasetIndex) {
        datasetIndex = datasetIndex || 0;
        return this.schema[datasetIndex];
    }

    getAllSchema() {
        if (this.schema.length === 1)
            return this.schema[0];
        else
            return this.schema;
    }

    getData(datasetIndex) {
        datasetIndex = datasetIndex || 0;
        return this.data[datasetIndex];
    }

    getAllData() {
        if (this.data.length === 1)
            return this.data[0];
        else
            return this.data;
    }

    getInputsNum() {
        return this.data.length;
    }

    getRowIndex(originalIndex, datasetIndex) {
        datasetIndex = datasetIndex || 0;
        let data = this.data[datasetIndex];
        if (Number.isInteger(originalIndex)) {
            if (originalIndex >= 0 && originalIndex < data.length)
                return originalIndex;
            else
                return -1;
        }
        else {
            let index = -1;
            for (let i = 0; i < data.length && index === -1; i++)
                if (data[i][0] === originalIndex)
                    index = i;
            return index;
        }
    }

    getColumnIndex(originalIndex, datasetIndex) {
        datasetIndex = datasetIndex || 0;
        let schema = this.schema[datasetIndex];
        if (Number.isInteger(originalIndex)) {
            if (originalIndex >= 0 && originalIndex < Object.keys(schema.attributes).length)
                return originalIndex;
            else
                return -1;
        }
        else {
            return Object.keys(schema.attributes).indexOf(originalIndex);
        }
    }

    getRow(rowIndex, datasetIndex) {
        datasetIndex = datasetIndex || 0;
        var index = this.getRowIndex(rowIndex, datasetIndex);
        if (index !== -1) {
            return this.data[datasetIndex][index];
        }
        else {
            return undefined;
        }
    }

    getColumn(columnName, datasetIndex) {
        datasetIndex = datasetIndex || 0;
        var column = undefined;
        var index = this.getColumnIndex(columnName, datasetIndex);
        if (index !== -1) {
            column = this.data[datasetIndex].map(function (data) {
                return data[index];
            })
        }
        return column;
    }

    saveChanges() {
        this.saveChangesCallback(this.changes)
    }

    addRow(row, updateCurrent, datasetIndex) {
        updateCurrent = updateCurrent !== undefined ? updateCurrent : true;
        datasetIndex = datasetIndex || 0;
        this.changes[datasetIndex].push({type: "ADD_ROW", row: row, index: datasetIndex});

        if (updateCurrent) this.data[datasetIndex][data.length] = row;
    }

    updateRow(rowIndex, row, updateCurrent, datasetIndex) {
        updateCurrent = updateCurrent !== undefined ? updateCurrent : true;
        datasetIndex = datasetIndex || 0;
        rowIndex = this.getRowIndex(rowIndex, datasetIndex);
        if (rowIndex === -1) {
            throw "Out of bounds, the row index: " + rowIndex + " is not a valid row."
        } else {
            this.changes.push({type: "UPDATE_ROW", rowIndex: rowIndex, row: row, index: datasetIndex});
            if (updateCurrent) this.data[datasetIndex][rowIndex] = row;
        }
    }

    removeRow(rowIndex, updateCurrent, datasetIndex) {
        updateCurrent = updateCurrent !== undefined ? updateCurrent : true;
        datasetIndex = datasetIndex || 0;
        let rowIndexDataset = this.getRowIndex(rowIndex, datasetIndex);
        if (rowIndexDataset === -1) {
            throw "Out of bounds, the row index: " + rowIndex + " is not a valid row."
        } else {
            this.changes.push({type: "REMOVE_ROW", rowIndex: rowIndex, index: datasetIndex});
            if (updateCurrent) this.data[datasetIndex].splice(rowIndexDataset, 1);
        }
    }

    addColumn(columnName, column, updateCurrent, datasetIndex) {
        updateCurrent = updateCurrent !== undefined ? updateCurrent : true;
        datasetIndex = datasetIndex || 0;
        if (column.length === this.data[datasetIndex].length) {
            var isCategorical = typeof column[0] === "string";

            var attr = {};
            if (isCategorical) {
                var uniqueValues = [];
                if (updateCurrent)
                    this.data[datasetIndex] = this.data[datasetIndex].map(function (data, i) {
                        data.push(column[i]);
                        if (uniqueValues.indexOf(column[i]) === -1)
                            uniqueValues.push(column[i]);
                        return data;
                    });

                attr.attribute_type = "CATEGORICAL";
                attr.uniqueValues = uniqueValues;
            }
            else {
                var min = column[0];
                var max = column[0];

                if (updateCurrent)
                    this.data[datasetIndex] = this.data[datasetIndex].map(function (data, i) {
                        data.push(column[i]);
                        if (min > column[i]) min = column[i];
                        if (max < column[i]) max = column[i];
                        return data;
                    });
                attr.attribute_type = "QUANTITATIVE";
                attr.max = min;
                attr.min = max;
            }

            if (updateCurrent)
                this.schema[datasetIndex].attributes[columnName] = attr;

            this.changes.push({
                type: "ADD_COLUMN",
                column: column,
                attr: attr,
                columnName: columnName,
                index: datasetIndex
            });

        } else {
            throw "Dimension mismatch, tried to add column with length:" + column.length + " to dataset with length:" +
            this.data[datasetIndex][0].length;
        }
    }

    updateColumn(columnName, column, updateCurrent, datasetIndex) {
        updateCurrent = updateCurrent !== undefined ? updateCurrent : true;
        datasetIndex = datasetIndex || 0;
        var columnIndex = this.getColumnIndex(columnName, datasetIndex);
        if (columnIndex !== -1 && column.length === this.data[datasetIndex].length) {
            var columnName = Object.keys(this.schema[datasetIndex].attributes).indexOf(columnIndex);
            var isCategorical = typeof column[i] === "string";

            var attr = {};
            if (isCategorical) {
                var uniqueValues = [];
                if (updateCurrent)
                    this.data[datasetIndex] = this.data[datasetIndex].map(function (data, i) {
                        data[columnIndex] = column[i];
                        if (uniqueValues.indexOf(column[i]) === -1)
                            uniqueValues.push(column[i]);
                        return data;
                    });

                attr.attribute_type = "CATEGORICAL";
                attr.uniqueValues = uniqueValues;
            }
            else {
                var min = column[0];
                var max = column[0];
                if (updateCurrent)
                    this.data[datasetIndex] = this.data[datasetIndex].map(function (data, i) {
                        data[columnIndex] = column[i];
                        if (min > column[i]) min = column[i];
                        if (max < column[i]) max = column[i];
                        return data;
                    });
                attr.attribute_type = "QUANTITATIVE";
                attr.max = min;
                attr.min = max;
            }
            if (updateCurrent)
                this.schema[datasetIndex].attributes[columnName] = attr;

            this.changes.push({
                type: "UPDATE_COLUMN",
                columnIndex: columnIndex,
                column: column,
                attr: attr,
                columnName: columnName,
                index: datasetIndex
            });

        } else if (columnIndex === -1) {
            throw "Column out of bounds, cannot find column with index: " + columnIndex;
        } else {
            throw "Dimension mismatch, tried to update existing column with length:" + this.data[datasetIndex][columnIndex].length +
            " with data column of length" + column.length;
        }
    }

    removeColumn(columnIndex, updateCurrent, datasetIndex) {
        updateCurrent = updateCurrent !== undefined ? updateCurrent : true;
        datasetIndex = datasetIndex || 0;
        columnIndex = this.getColumnIndex(columnIndex, datasetIndex);
        if (columnIndex !== -1) {
            this.changes.push({type: "REMOVE_COLUMN", columnIndex: columnIndex, index: datasetIndex});
            if (updateCurrent)
                this.data[datasetIndex] = this.data[datasetIndex].map(function (data) {
                    data.splice(columnIndex, 1);
                    return data;
                });
            if (updateCurrent)
                delete this.schema[datasetIndex].attributes[Object.keys(this.schema[datasetIndex].attributes)[columnIndex]];
        } else {
            throw "Column out of bounds, cannot find column with index: " + columnIndex;
        }
    }

    mergeDataset(updateCurrent) {
        updateCurrent = updateCurrent !== undefined ? updateCurrent : true;
        var schemaAttrNames = this.schema.map(function (schema) {
            return Object.keys(schema.attributes).join(',');
        });
        var sameColsSchema = true;
        for (var i = 1; i < schemaAttrNames.length && sameColsSchema; i++) {
            sameColsSchema = schemaAttrNames[i] === schemaAttrNames[0];
        }

        var sameColsData = true;

        for (var i = 1; i < this.data.length && sameColsData; i++) {
            sameColsData = this.data[i][0].length === this.data[0][0].length;
        }

        if (sameColsSchema && sameColsData) {
            if (updateCurrent) {
                for (var i = 1; i < this.data.length; i++) {
                    this.data[0] = this.data[0].concat(this.data[i]);
                    delete this.data[i];
                }

                for (var i = 1; i < this.schema.length; i++) {
                    delete this.schema[i];
                }
            }

            this.changes.push({
                type: "DATA_MERGE"
            });

        } else {
            throw "Data does not share same columns";
        }
    }

}

if (typeof WorkerGlobalScope === 'undefined' || !self instanceof WorkerGlobalScope) {
    module.exports = DataHandler;
}