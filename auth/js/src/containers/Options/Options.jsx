'use strict';

var React = require('react');
var OptionsCreator = require('./SpecificOptions/OptionsCreator/OptionsCreator');
var CustomCardOptions = require('./SpecificOptions/CustomCardOptions');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var FunctionalWorker = require('../../workers/WorkerWrapper');
var workerSupervisor = require('../../model/WorkerSupervisor');
var DataInput = require('./SpecificOptions/DataInputOptions');

var Options = React.createClass({


    saveInternalState: function () {
        var self = this;
        var id = this.props.selectedCardPanel !== undefined ? this.props.selectedCardPanel : this.props.selectedCard;
        return function (state) {
            if (self.props.cards.byId[self.props.selectedCard].type === 'data_input')
                self.props.dispatch({
                    type: ActionTypes.SET_CARD_OPTIONS,
                    options: [state],
                    id: id
                })
        }
    },

    startWork: function () {
        workerSupervisor.startWorking(this.props.selectedCardPanel !== undefined ? this.props.selectedCardPanel : this.props.selectedCard);
        this.props.dispatch({type: ActionTypes.CARD_CONFIGURED});
    },

    render: function () {
        var inPanel = this.props.inPanel;
        var selectedCard = this.props.selectedCard;

        if (selectedCard >= 0 && this.props.cards.byId[selectedCard] !== undefined) {
            var optionsContent;
            var self = this;
            var ancestors = [];
            this.props.connections.allIds.forEach(function (connectionID) {
                if (self.props.connections.byId[connectionID].end === selectedCard)
                    ancestors.push(self.props.connections.byId[connectionID].start)
            });

            switch (this.props.cards.byId[selectedCard].type) {
                case "options":
                    optionsContent = <OptionsCreator selectedCard={selectedCard} inPanel={inPanel}
                                                     saveInternalState={this.saveInternalState()}
                                                     startWork={this.startWork}/>;
                    break;

                case "data_input":
                    optionsContent = <DataInput key={selectedCard} selectedCard={selectedCard}
                                                inPanel={inPanel}
                                                saveInternalState={this.saveInternalState()}
                                                startWork={this.startWork}/>;
                    break;
                default:
                    optionsContent = <CustomCardOptions selectedCard={selectedCard}
                                                        inPanel={inPanel}
                                                        saveInternalState={this.saveInternalState()}
                                                        startWork={this.startWork}
                                                        key={selectedCard}/>;
            }
            return (
                <div className="pt-3 h-100 overflow-y">
                    {optionsContent}
                </div>
            );

        } else {
            return <div/>
        }
    }

});


function mapStateToProps(state) {
    return {
        cards: state.cards,
        connections: state.connections
    };
}

module.exports = connect(mapStateToProps)(Options);
