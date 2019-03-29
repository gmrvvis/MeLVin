var ActionTypes = require('../actions/ActionTypes');
var ConnectionTypes = require('../constants/ConnectionTypes');
var socket = require('../model/Socket');

class BackendScriptWorkerWrapper {

    constructor(input, state, dispatch, id, operationList) {
        this.input = input;
        this.state = state;
        this.dispatch = dispatch;
        this.id = id;
        this.operationList = operationList;
    }

    start() {
        this.dispatch({type: ActionTypes.SET_CARD_PROP, value: true, id: this.id, prop: "processing"});

        this.dispatch({
            type: ActionTypes.SET_CARD_PROP, value: {progress: 0, info: ""}, id: this.id,
            prop: "progress"
        });

        var self = this;
        this.worker = new Worker('./auth/workers/js/backendWorker.js');
        this.worker.postMessage(JSON.stringify({type: 'work',
            data: {
                input: this.input,
                state: this.state,
                operationList: this.operationList,
                currentID: this.id,
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
                self.dispatch({type: ActionTypes.SET_CARD_PROP, value: result[key], id: self.id, prop: key});
            });
        }

        this.dispatch({type: ActionTypes.SET_CARD_PROP, value: false, id: this.id, prop: "processing"});
        this.dispatch({type: ActionTypes.FINISHED_WORK, id: this.id});
        this.worker.terminate();
    }
}

module.exports = BackendScriptWorkerWrapper;