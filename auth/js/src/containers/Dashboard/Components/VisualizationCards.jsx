"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../../actions/ActionTypes');
var FileUpload = require('../../FileUpload/LightBoxContainer');
var vizParams = require('../../../constants/CardsSchema');
var ContentContainer = require('../ContentContainer');
var Card = require('../Card');

var VisualizationCards = React.createClass({

    getInitialState: function () {
        return {fadeIn: false, showFileUpload: false}
    },

    onShowDashboard: function () {
        var self = this;
        this.setState({fadeIn: false});
        setTimeout(function () {
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "Home"})
        }, 200);
    },

    onHideFileUpload: function () {
        this.setState({showFileUpload: false})
    },

    onShowFileUpload: function () {
        this.setState({showFileUpload: true})
    },

    openCardCreator: function () {
        var self = this;
        this.fadeOut(function () {
            self.props.dispatch({type: ActionTypes.CLEAR_CREATOR});
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "VisualizationCreator"})
        });
    },

    onDownloadAll: function () {
        this.props.dispatch({type: ActionTypes.VIZ_DOWNLOAD_ALL});
    },

    onRemoveViz: function (ids) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.REMOVE_VIZ, ids: ids})
        }
    },

    downloadSchema: function (vizName) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.VIZ_DOWNLOAD_ONE, ids: [vizName]});
        }
    },

    editSchema: function (vizName) {
        var self = this;
        var schemaName = vizName;
        var basePath = './auth/visualizations/schemas/';
        var downloadURI = basePath + schemaName;

        $.getJSON(downloadURI, function (schema) {
            self.props.dispatch({type: ActionTypes.EDIT_CUSTOMVIZ, schema: schema});
            self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "VisualizationCreator"});
        })
    },

    fadeOut: function (callback) {
        this.setState({fadeIn: false});
        setTimeout(function () {
            callback()
        }, 200);
    },

    componentDidMount: function () {
        var self = this;
        setTimeout(function () {
            self.setState({fadeIn: true})
        }, 10);
    },

    render: function () {
        var self = this;

        var buttons = [{action: this.onShowFileUpload, text: 'Upload card', iconClass: 'fa fa-upload'},
            {action: this.openCardCreator, text: 'Create new card', iconClass: 'fa fa-plus'}];
        var visualizationCards = (<div className="d-flex h-100 w-100 justify-content-center align-items-center">
            <h3>No visualization cards available</h3>
        </div>);

        var cards = this.props.customCardNames.filter(function (vizID) {
            return (vizParams.cards[vizID].category === 'viz' && vizParams.cards[vizID].id !== 'options')
        });

        if (cards.length > 0) {

            visualizationCards = cards.map(function (vizID) {
                var vizName = vizParams.names[vizID];
                var card = vizParams.cards[vizID];

                return (<Card thumbnail={card.thumbnail}
                              name={vizName}
                              onDownload={self.downloadSchema(vizID)}
                              onEdit={function () {
                                  self.editSchema(vizName)
                              }}
                              onRemove={self.onRemoveViz([vizID])}/>
                )
            })
        }

        if (self.props.customCardNames.length > 1) {
            buttons.push({action: self.onDownloadAll, text: 'Download all', iconClass: 'fa fa-save'});
            buttons.push({action: self.onRemoveViz(cards), text: 'Remove all', iconClass: 'fa fa-trash'});
        }

        var fileUpload = this.state.showFileUpload ?
            <FileUpload onClose={this.onHideFileUpload} path={'./auth/uploadViz'}/> :
            <div/>;

        var fadeClass = this.state.fadeIn ? "fade-in" : "fade-out";

        return <ContentContainer fadeClass={fadeClass}
                                 fileUpload={fileUpload}
                                 buttons={buttons}
                                 cards={visualizationCards}
                                 title={'Custom components'}
                                 subtitle={'Visualization cards'}
                                 onShowDashboard={this.onShowDashboard}/>
    }
});

function mapStateToProps(state) {
    return {
        cards: state.cards,
        customCardNames: Object.keys(vizParams.names)
    };
}

module.exports = connect(mapStateToProps)(VisualizationCards);