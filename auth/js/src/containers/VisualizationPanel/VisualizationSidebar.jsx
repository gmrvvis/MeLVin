"use strict";

var React = require('react');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var viewsPanel = require('../../model/ViewsPanel');
var vizParams = require('../../constants/CardsSchema');

var VisualizationSidebar = React.createClass({

    getInitialState: function () {
        return {tabIndex: 0}
    },

    _dragCardStart: function (id) {
        return function (event) {
            event.dataTransfer.setData("text", id);
            viewsPanel.showDropZone();
        }
    },

    _dragCardEnd: function () {
        viewsPanel.hideDropZone();
    },

    _toggleSidebar: function () {
        this.props.dispatch({type: ActionTypes.TOGGLE_PANEL_SIDEBAR, panelID: this.props.panelID})
    },

    _openTab: function (index) {
        var self = this;
        return function () {
            self.setState({tabIndex: index});
        }
    },

    render: function () {
        var self = this;
        var vizCards = [];

        this.props.cards.allIds.forEach(function (cardID, k) {
            var card = self.props.cards.byId[cardID];
            if (card.category === 'viz')
                vizCards.push(
                    <div key={k} className='col-lg-12 mb-3'>
                        <div className="dragCard"
                             onDragStart={self._dragCardStart(card.id)} onDragEnd={self._dragCardEnd}
                             draggable="true">
                            <div className="card">
                                <div className="card-body padding-0">
                                    <div className="thumbnail m-bottom-0 border-0">
                                        <img src={'./' + vizParams.cards[card.type].thumbnail}
                                             className="disable-events thumbnail-image"/>
                                    </div>
                                </div>
                                <div className='card-footer card-footer-blue'>
                                    <div className="caption">
                                        <div className="container-fluid">
                                            <div className="row vertical-align">
                                                <div className="col flex-grow title" style={{textAlign: "center"}}>
                                                    <h5>{vizParams.cards[card.type].title}</h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
        });

        var sidebarClass = this.props.panel.sideBarOpen ? "col-2 sidebar-viz open" : "col-2 sidebar-viz";
        return (
            <div id="sidebar" className={sidebarClass}>
                <i className="fa fa-times" onClick={this._toggleSidebar}/>
                <div className="tab-content generic-nav">
                    <h4>Visualization cards</h4>
                    <div className="scroll-y first-padding content">
                        {vizCards}
                    </div>
                </div>
            </div>
        );

    }

});

function mapStateToProps(state) {
    return {
        cards: state.cards,
        panel: state.panels.byId[state.ui.selectedVizPanelID],
        panelID: state.ui.selectedVizPanelID
    };
}


module.exports = connect(mapStateToProps)(VisualizationSidebar);
