var ConnectionTypes = require('./../constants/ConnectionTypes');
var vizParams = {
    "names": {options: "options"},
    "cards": {
        "data_input": {
            id: "data_input",
            thumbnail: "./auth/assets/images/data.svg", title: "Data Input",
            hasOptions: true,
            description: "Loads tabular datasets from the server",
            workerPath: "./auth/workers/js/dataInputWorker.js",
            allowOutConn: true,
            allowInConn: true,
            outConnections: [{type: ConnectionTypes.DATA_CONNECTION, num: Infinity}, {type: ConnectionTypes.OPTION_CONNECTION, num: Infinity}],
            inConnections: [{type: ConnectionTypes.OPTION_CONNECTION, num: Infinity}],
            category: "data"
        },
        "options": {
            id: "options",
            thumbnail: "./auth/previews/options.svg", title: "Options",
            hasOptions: false,
            description: "Makes options panel visual in any panel",
            allowOutConn: true,
            allowInConn: true,
            outConnections: [{type: ConnectionTypes.OPTION_CONNECTION, num: 1}],
            inConnections: [{type: ConnectionTypes.OPTION_CONNECTION, num: 1}],
            category: "viz"
        }
    },
    "cardMenu": [
        {
            panelID: "custom", panelName: "Custom",
            cards: []
        },
        {
            panelID: "builtin", panelName: "Built-in",
            cards: ["data_input", "options"]
        }
    ]
};

module.exports = vizParams;