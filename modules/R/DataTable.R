myClass <- function(data, changes){
    # attributes
    this.data <- data
    structure(class = "myClass", list(
    # methods
    set_x = function(y) self.x <<- y,
    get_x = function() this.x
    ))

    getData <- function() {
        return(data)
    }

    getAttributeFromData <- function(data, columnName) {
        isCategorical <- typeof(data) == "character" || typeof(data) == "logical" || is.factor(data)
        attr <- list(name = columnName)
        if (isCategorical) {
            attr$attribute_type = "CATEGORICAL"
            attr$uniqueValues = unique(data)
        } else{
            attr$attribute_type = "QUANTITATIVE"
            attr$max = max(data)
            attr$min = min(data)
        }
        return(attr)
    }

    setData <- function(newData) {
        data <<- newData
    }

    addRow <- function(row) {
        data[nrow(data) + 1, ] <<- row
        changes[[length(changes) + 1]] <<- list(type = "ADD_ROW", row = row)
    }

    updateRow <- function(rowIndex, row) {
        data[rowIndex, ] <<- row
        changes[[length(changes) + 1]] <<-
        list(type = "UPDATE_ROW",
        rowIndex = rowIndex,
        row = row)
    }

    removeRow <- function(rowIndex) {
        data <<- data[-rowIndex, ]
        changes[[length(changes) + 1]] <<-
        list(type = "REMOVE_ROW", rowIndex = rowIndex)
    }

    addColumn <- function(columnName, column) {
        data[, columnName]  <<- column
        changes[[length(changes) + 1]] <<-
        list(type = "ADD_COLUMN",
        column = column,
        columnName = columnName,
        attr=getAttributeFromData(column, columnName))
    }

    updateColumn <- function(columnIndex, column) {
        data[, columnIndex]  <<- column
        changes[[length(changes) + 1]] <<-
        list(type = "UPDATE_COLUMN",
        column = column,
        columnIndex = columnIndex,
        attr=getAttributeFromData(column, columnIndex))
    }

    removeColumn <- function(columnIndex) {
        data[, columnIndex]  <<- NULL
        changes[[length(changes) + 1]] <<-
        list(type = "REMOVE_COLUMN", columnIndex = columnIndex)
    }

}