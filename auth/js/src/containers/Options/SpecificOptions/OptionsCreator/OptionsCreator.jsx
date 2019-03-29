'use strict';
var VisualizationOptions = require('../../../../constants/VisualizationOptions');
var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../../actions/ActionTypes');
var vizParams = require('../../../../constants/CardsSchema');
var CustomCardOptions = require('../CustomCardOptions');
var workerSupervisor = require('../../../../model/WorkerSupervisor');

var OptionsCreator = React.createClass({

    getInitialState() {
        return {open: -1, showAddOptionLB: false}
    },

    onOpen: function (index) {
        var self = this;
        return function () {
            self.setState({open: index})
        }
    },

    onRemove: function (layerID) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.REMOVE_LAYER, id: layerID})
        }
    },

    onOpenAddOption: function () {
        this.props.dispatch({type: ActionTypes.OPTION_SHOW_LB, id: this.props.selectedCard})
    },

    onClose: function (index) {
        this.setState({open: -1})
    },

    showAddOptionLB: function () {
        this.setState({showAddOptionLB: true, id: this.props.selectedCard})
    },

    onRemoveOption(optionIndex) {
        var self = this;
        return function () {
            var options = self.props.options[self.props.selectedCard];

            options.splice(optionIndex, 1);

            self.props.dispatch({
                type: ActionTypes.SET_CARD_OPTIONS,
                id: self.props.selectedCard,
                options: options,
                optionId: options.id
            });
        }
    },

    saveInternalState: function () {
        var self = this;
        return function (state) {
            if (self.props.cards.byId[self.props.selectedCard].type === 'data_input')
                self.props.dispatch({
                    type: ActionTypes.SET_CARD_OPTIONS,
                    options: [state],
                    id: self.props.selectedCard
                })
        }
    },

    startWork: function (alternativeOptions) {
            workerSupervisor.startWorking(alternativeOptions[0].originalId, alternativeOptions[0]);
    },

    render: function () {
        var generalOptions = this.props.options[this.props.selectedCard];

        var options = (
            <div className="alert alert-info d-flex justify-content-center">
                <span>No options added yet</span>
            </div>
        );

        if (generalOptions && generalOptions.length > 0) {
            options = (
                <CustomCardOptions cardGeneralOptions={generalOptions}
                                   selectedCard={this.props.selectedCard} inPanel={this.props.inPanel}
                                   showRemove={!this.props.inPanel} onRemoveOption={this.onRemoveOption}
                                   saveInternalState={this.saveInternalState()}
                                   startWork={this.startWork}
                />
            )
        }

        var addButton;
        if (!this.props.inPanel) {
            addButton = (
                <div className="d-flex justify-content-center">
                    <button className="btn btn-dark btn-sm" onClick={this.onOpenAddOption}>
                        <i className="fa fa-plus mr-2"/>
                        <span>Add new option</span>
                    </button>
                </div>
            )
        }

        return (
            <div className="d-flex flex-column">
                {options}
                {addButton}
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        cards: state.cards,
        options: state.options
    };
}

module.exports = connect(mapStateToProps)(OptionsCreator);
