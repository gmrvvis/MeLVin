import numpy as np


class DataHandler:
    def __init__(self, data, schema):
        self.data = data
        self.schema = schema
        self.changes = []

    def get_attribute_from_data(self, data, column_name):
        is_categorical = isinstance(data, np.ndarray) and (isinstance(data[0].item(), str) or isinstance(data[0].item(), bool))
        attr = dict(name=column_name)
        if is_categorical:
            attr["attribute_type"] = "CATEGORICAL"
            attr["uniqueValues"] = np.unique(data).aslist()
        else:
            attr["attribute_type"] = "QUANTITATIVE"
            attr["max"] = np.max(data)
            attr["min"] = np.min(data)

        return attr

    def getSchema(self, dataset_index=0):
        return self.schema[dataset_index]

    def getAllSchema(self):
        if len(self.schema) == 1:
            return self.schema[0]
        else:
            return self.schema

    def getData(self, dataset_index=0):
        return self.data[dataset_index]

    def getAllData(self):
        if len(self.data) == 1:
            return self.data[0].iloc[:, 1:len(self.data[0].columns)]
        else:
            return [dataset.iloc[:, 1:len(dataset.columns)] for dataset in self.data]

    def getRowIndex(self, row_index, dataset_index=0):
        data = self.data[dataset_index]
        if isinstance(row_index, int):
            if 0 <= row_index < len(data):
                return row_index
            else:
                return -1
        else:
            index = data.index[data.iloc[:, 0] == row_index]
            if len(index) > 0:
                return index[0]
            else:
                return -1

    def getColumnIndex(self, column_index, dataset_index=0):
        data = self.data[dataset_index]
        if isinstance(column_index, int):
            if 0 <= column_index < self.data[dataset_index].shape[1]:
                return data.columns[column_index]
            else:
                return -1
        else:
            try:
                list(data.columns).index(column_index)
                return column_index
            except ValueError:
                return -1

    def getRow(self, row_index, dataset_index=0):
        index = self.getRowIndex(row_index, dataset_index)
        if index != -1:
            return np.array(self.data[dataset_index].iloc[[index]])[0]
        else:
            return None

    def getColumn(self, column_name, dataset_index=0):
        index = self.getColumnIndex(column_name, dataset_index)
        if index != -1:
            return np.array(self.data[dataset_index][index])
        else:
            return None

    def addRow(self, row, dataset_index=0):
        self.data[dataset_index].append(row)
        self.changes.append(dict(type="ADD_ROW", row=row, index=dataset_index))

    def updateRow(self, row_index, row, dataset_index=0):
        row_index = self.getRowIndex(row_index, dataset_index)
        if row_index == -1:
            raise ValueError("Out of bounds, the row index: " + row_index + " is not a valid row.")
        else:
            self.data[dataset_index][row_index] = row
            self.changes.append(dict(type="UPDATE_ROW", rowIndex=row_index, row=row, index=dataset_index))

    def removeRow(self, row_index, dataset_index=0):
        row_index = self.getRowIndex(row_index, dataset_index)
        if row_index == -1:
            raise ValueError("Out of bounds, the row index: " + row_index + " is not a valid row.")
        else:
            self.data[dataset_index] = self.data[dataset_index].drop(row_index)
            self.changes.append(dict(type="REMOVE_ROW", rowIndex=row_index, index=dataset_index))

    def addColumn(self, column_name, column, dataset_index):
        self.data[dataset_index][column_name] = column
        self.changes.append(dict(type="ADD_COLUMN", column=column, columnName=column_name,
                                 attr=self.get_attribute_from_data(column, column_name),
                                 index=dataset_index))

    def updateColumn(self, column_name, column, dataset_index):
        column_index = self.getColumnIndex(column_name, dataset_index)
        if column_index == -1:
            raise ValueError("Column not found, the column: " + column_name + " does not exit.")
        else:
            self.data[dataset_index][column_index] = column
            self.changes.append(dict(type="UPDATE_COLUMN", column=column, columnIndex=column_index,
                                     attr=self.get_attribute_from_data(column, column_name),
                                     index=dataset_index))

    def removeColumn(self, column_name, dataset_index):
        column_index = self.getColumnIndex(column_name, dataset_index)
        if column_index == -1:
            raise ValueError("Column not found, the column: " + column_name + " does not exit.")
        else:
            self.data[dataset_index] = self.data[dataset_index].drop(column_index, axis=1)
            self.changes.append(dict(type="REMOVE_COLUMN", columnIndex=column_index, index=dataset_index))

    def addDataset(self, dataset):
        self.data[len(self.data)] = dataset

        pass
