var ActionTypes = require('../actions/ActionTypes');
var ConnectionTypes = require('../constants/ConnectionTypes');
var structTypes = require('../constants/ConnectionStructTypes').types;

class WorkerWrapper {

    constructor(input, state, dispatch, id, operationList, workerPath, type) {
        this.input = input;
        this.state = state;
        this.dispatch = dispatch;
        this.id = id;
        this.operationList = operationList;
        this.workerPath = workerPath;
        this.type = type;
    }

    start() {
        this.dispatch({type: ActionTypes.SET_CARD_PROP, value: true, id: this.id, prop: "processing"});

        this.dispatch({
            type: ActionTypes.SET_CARD_PROP, value: {progress: 0, info: ""}, id: this.id,
            prop: "progress"
        });

        var self = this;
        if (this.type === 'data_input') {
            this.worker = new Worker(this.workerPath);
        }
        else {
            this.worker = new Worker('./auth/workers/js/genericWorker.js');
        }
        this.worker.postMessage(JSON.stringify({
            type: 'work',
            data: {
                input: this.input,
                state: this.state,
                operationList: this.operationList,
                currentID: this.id,
                workerPath: this.workerPath
            }
        }));
        this.worker.onmessage = function (message) {
            var parsedMessage = JSON.parse(message.data);
            switch (parsedMessage.type) {
                case 'PROGRESS':
                    self.setProgress({progress: parsedMessage.progress, info: parsedMessage.info});
                    break;

                case 'RESULT':
                    self.setResult(parsedMessage.data);
                    break;
            }
        };
        return this.worker;
    };

    setProgress(progress) {
        this.dispatch({type: ActionTypes.SET_CARD_PROP, value: progress, id: this.id, prop: "progress"})
    }

    setResult(data) {
        if (data !== undefined && Object.keys(data).length > 0) {
            var result = data;
            var self = this;
            Object.keys(result).forEach(function (key) {

                var value = result[key];
                var correctStructure = true;
                try {
                    if(ConnectionTypes.typeFromProperty[key])
                    ConnectionTypes.propertyStructure[ConnectionTypes.typeFromProperty[key]].forEach(function (structure) {
                        var property = value;

                        structure.path.forEach(function (path) {
                            property = property[path];
                        });

                        switch (structure.type) {
                            case structTypes.OBJECT:
                                correctStructure = correctStructure && typeof property === 'object' && property !== null;
                                break;
                            case structTypes.ARRAY:
                                correctStructure = correctStructure && Array.isArray(property);
                                break;
                            case structTypes.STRING:
                                correctStructure = correctStructure && (typeof property === 'string' || property instanceof String);
                                break;
                            case structTypes.NUMERIC:
                                correctStructure = correctStructure && typeof property === 'number';
                                break;
                            case structTypes.BOOL:
                                correctStructure = correctStructure && typeof property === 'boolean';
                                break;
                        }
                    });
                }
                catch(e) {
                    correctStructure = false;
                }

                if (correctStructure)
                    self.dispatch({type: ActionTypes.SET_CARD_PROP, value: value, id: self.id, prop: key});
                else {
                    self.dispatch({
                        type: ActionTypes.SHOW_ERROR_MESSAGE,
                        message: 'Property "' + key+'" has incorrect value, at card with id ' + self.id
                    });
                }
            });
        }

        this.dispatch({type: ActionTypes.SET_CARD_PROP, value: false, id: this.id, prop: "processing"});
        this.dispatch({type: ActionTypes.FINISHED_WORK, id: this.id});
        this.worker.terminate();
    }
}

module.exports = WorkerWrapper;