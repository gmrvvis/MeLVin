library(jsonlite)
library(readr)
library(mongolite)
require(data.table)
args <- commandArgs(TRUE)
username <- args[1]
jobId <- args[2]
data <- list()
changes <- list()


jobs = mongo(collection = "jobs", db = "melvin_users")
job = jobs$find(paste('{"username":"', username, '","id":"', jobId, '"}', sep =
""))


operationList <- fromJSON(read_file(job$operationList))
state <- fromJSON(read_file(job$state))
input <- fromJSON(read_file(job$input))
for (changePath in job$changes[[1]]) {
  change <- fromJSON(read_file(changePath))
  changes[[change$name]] = change$change
}

process <- function(input, state, setResult, setProgress, CODE) {
    eval(parse(text = CODE))
    setResult(state)
}

schemaList <- fromJSON(read_file(job$schemaPath))
code <- read_file(job$codePath)
dataList <- fromJSON(read_file(job$dataPath))


data <- list()
for (dataItem in dataList) {
    index <- length(data) + 1
    data[[index]] <- data.frame(dataItem, stringsAsFactors = FALSE)
    data[[index]] <- data.frame(lapply(data[[index]], function(x) {
        if (! is.na(as.numeric(x)))
        x = as.numeric(x)
        return(x)
    }))
    #data[[index]] <- setDT(data.frame(do.call(rbind, dataItem), stringsAsFactors=FALSE))
    #indx <- which(sapply(data[[index]], is.character))
    #data[[index]][, (indx) := lapply(.SD, type.convert), .SDcols = indx]
    #data[[index]] <- data.frame(data[[index]])
}

getData <- function(index) {
    return(data[[index]])
}

getSchema <- function(index) {
    return(schemaList[[index]])
}

getAttributeFromData <- function(data, columnName) {
    isCategorical <-
    typeof(data) == "character" ||
        typeof(data) == "logical" ||
        is.factor(data)
    attr <- list(name = columnName)
    if (isCategorical) {
        attr$attribute_type = "CATEGORICAL"
        attr$uniqueValues = unique(data)
    } else {
        attr$attribute_type = "QUANTITATIVE"
        attr$max = max(data)
        attr$min = min(data)
    }
    return(attr)
}


addRow <- function(row, datasetIndex) {
    if (missing(datasetIndex))
    datasetIndex <- 1
    data[[datasetIndex]][nrow(data) + 1,] <<- row
    changes[[length(changes) + 1]] <<-
    list(type = "ADD_ROW",
    row = row,
    index = datasetIndex - 1)
}

updateRow <- function(rowIndex, row, datasetIndex) {
    if (missing(datasetIndex))
    datasetIndex <- 1
    data[[datasetIndex]][rowIndex,] <<- row
    changes[[length(changes) + 1]] <<-
    list(
    type = "UPDATE_ROW",
    rowIndex = rowIndex,
    row = row,
    index = datasetIndex - 1
    )
}

removeRow <- function(rowIndex, datasetIndex) {
    if (missing(datasetIndex))
    datasetIndex <- 1
    data[[datasetIndex]] <<- data[[datasetIndex]][- rowIndex,]
    changes[[length(changes) + 1]] <<-
    list(type = "REMOVE_ROW",
    rowIndex = rowIndex,
    index = datasetIndex - 1)
}

addColumn <- function(columnName, column, datasetIndex) {
    if (missing(datasetIndex))
    datasetIndex <- 1
    data[[datasetIndex]][, columnName] <<- column
    changes[[length(changes) + 1]] <<-
    list(
    type = "ADD_COLUMN",
    column = column,
    columnName = columnName,
    attr = getAttributeFromData(column, columnName),
    index = datasetIndex - 1
    )
}

updateColumn <- function(columnIndex, column, datasetIndex) {
    if (missing(datasetIndex))
    datasetIndex <- 1
    data[[datasetIndex]][, columnIndex] <<- column
    changes[[length(changes) + 1]] <<-
    list(
    type = "UPDATE_COLUMN",
    column = column,
    columnIndex = columnIndex,
    attr = getAttributeFromData(column, columnIndex),
    index = datasetIndex - 1
    )
}

removeColumn <- function(columnIndex, datasetIndex) {
    if (missing(datasetIndex))
    datasetIndex <- 1
    data[[datasetIndex]][, columnIndex] <<- NULL
    changes[[length(changes) + 1]] <<-
    list(type = "REMOVE_COLUMN",
    columnIndex = columnIndex,
    index = datasetIndex - 1)
}

addDataset <- function(dataset) {
    data[[length(data)]] <- dataset
    schema <- list()
    indexedDataset <- cbind(key = seq(1, nrow(dataset), by=1), dataset);
    schema$attributes <- lapply(colnames(indexedDataset), function(colname){return(getAttributeFromData(indexedDataset, colname))})
    names(schema$attributes) <- colnames(indexedDataset)
    schema$attributes$key = list(attribute_type = "PKEY")
    changes[[length(changes) + 1]] <<-
    list(type = "ADD_DATASET",
    dataset = unname(lapply(split(indexedDataset, seq(nrow(indexedDataset))), unlist)),
    schema = schema)
}


dataHandler <- list(
getData = getData,
getSchema = getSchema,
addRow = addRow,
updateRow = updateRow,
removeRow = removeRow,
addColumn = addColumn,
updateColumn = updateColumn,
removeColumn = removeColumn,
addDataset = addDataset
)

setResult <- function(state) {
    #print(c("RESULT: ", state))
}

setProgress <- function(progress, info) {
    #print(c("PROGRESS: ", progress, info))
}

state$dataHandler = dataHandler

process(input, state, setResult, setProgress, code)


file.create(job$resultPath)
state$dataHandler <- NULL
state$children <- NULL
state$parents <- NULL
write(toJSON(list(changes = changes, state = state), auto_unbox = TRUE), file = job$resultPath)