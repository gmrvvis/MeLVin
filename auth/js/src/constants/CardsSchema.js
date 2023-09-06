var ConnectionTypes = require('./../constants/ConnectionTypes');
var vizParams = {
    "names": {options: "options"},
    "cards": {
        "data_input": {
            id: "data_input",
            thumbnail: "./auth/assets/images/data.svg", title: "Data loader",
            hasOptions: true,
            description: "Loads tabular datasets from the server",
            workerPath: "./auth/workers/js/dataInputWorker.js",
            allowOutConn: true,
            allowInConn: true,
            outConnections: [{type: ConnectionTypes.DATA_CONNECTION, unique: false}, {type: ConnectionTypes.OPTION_CONNECTION, unique: false}],
            inConnections: [{type: ConnectionTypes.FILE_CONNECTION, unique: true}, {type: ConnectionTypes.OPTION_CONNECTION, unique: false}],
            category: "data"
        },
        "options": {
            id: "options",
            thumbnail: "./auth/previews/options.svg", title: "Options",
            hasOptions: false,
            description: "Makes options panel visual in any panel",
            allowOutConn: true,
            allowInConn: true,
            outConnections: [{type: ConnectionTypes.OPTION_CONNECTION, unique: true}],
            inConnections: [{type: ConnectionTypes.OPTION_CONNECTION, unique: true}],
            category: "viz"
        }
    },
    "cardMenu": [
        {
            panelID: "custom", panelName: "Custom",
            cards: ["data_input", "options"]
        },
        // {
        //     panelID: "builtin", panelName: "Built-in",
        //     cards: ["data_input", "options"]
        // }
    ]
};

module.exports = vizParams;