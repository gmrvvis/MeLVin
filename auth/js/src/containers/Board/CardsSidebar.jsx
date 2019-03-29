'use strict';

var React = require('react');
var ActionTypes = require('../../actions/ActionTypes');
var connect = require("react-redux").connect;
var VisualizationOptions = require('../../constants/VisualizationOptions');
var vizParams = require('../../constants/CardsSchema');

var CardsSidebar = React.createClass({

    _openTab: function (index) {
        this.props.dispatch({type: ActionTypes.OPEN_TAB_LEFT_SIDEBAR, index: index})
    },

    _dragCardStart: function (event) {
        //TODO: Better way of connecting cards and html
        var properties = _.find(this.props.cardsSchema, {id: $(event.target).prop("id")});
        properties["type"] = "card";
        this.props.dispatch({type: ActionTypes.START_CARD_DRAGGING});
        //TODO: replace by reducer action
        event.dataTransfer.setData("text", JSON.stringify(properties));
    },

    _onDragEnd: function (event) {
        this.props.dispatch({type: ActionTypes.STOP_CARD_DRAGGING});
    },


    _addCard: function (type) {
        var self = this;
        return function () {

            //TODO: Instead of max, limit to viewbox
            var maxPosX = 10;
            var maxPosY = 10;

            var foundEmptyPos = false;

            var properties = self.props.cardsSchema[type];

            var positionsX = _.pluck(self.props.cards.byId, 'posX');
            var positionsY = _.pluck(self.props.cards.byId, 'posY');

            for (var i = 0; i <= maxPosX && !foundEmptyPos; i++)
                for (var j = 0; j <= maxPosY && !foundEmptyPos; j++)
                    if (positionsX.indexOf(i) === -1 && positionsY.indexOf(i) === -1) {

                        var cardData = {
                            posX: i,
                            posY: j,
                            title: properties.title,
                            type: properties.id,
                            category: properties.category,
                            schema: {},
                            filters: [],
                            children: [],
                            parents: []
                        };

                        var options = (vizParams.cards[type].options || []).map(function (option) {
                            return VisualizationOptions.generateOption(option);
                        });

                        self.props.dispatch({
                            type: ActionTypes.ADD_CARD, id: self.props.cards.lastId, cardData: cardData,
                            options: options
                        });
                        foundEmptyPos = true;
                    }

            self.props.dispatch({type: ActionTypes.CLOSE_LEFT_SIDEBAR});
        }
    },

    //TODO: create child CardList and CardItem
    render: function () {
        var self = this;
        this.cardMenu = vizParams.cardMenu;
        this.props.cardsSchema = vizParams.cards;
        this.boardPositions = {};
        var sidebarClass = "col-3 sidebar-right";
        if (this.props.leftSideBarOpen && !this.props.cardBeingDragged) sidebarClass += " open-right";

        return (
            <div className="d-flex flex-column" style={{height: "100%"}}>
                <div className="row-gray">
                    <h4 className="text-center mb-4 mt-4">Cards</h4>
                    <ul className="nav nav-tabs nav-fill">
                        {
                            this.cardMenu.map(function (tab, i) {
                                var className = i === self.props.leftSideBarTabIndex ? "nav-link active" : "nav-link";
                                return (
                                    <li key={i} className="nav-item">
                                        <a href={"#" + tab.panelID} className={className} onClick={function () {
                                            self._openTab(i)
                                        }}>
                                            {tab.panelName}
                                        </a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className="container tab-content scroll-y pt-3">
                    {
                        this.cardMenu.map(function (tab, i) {
                            var tabClass = ((i === self.props.leftSideBarTabIndex) ? "row tab-pane active" :
                                "row tab-pane");
                            var cards = vizParams.cards;
                            return (<div key={i} id={tab.panelID} className={tabClass}>{
                                tab.cards.map(function (cardID, k) {
                                    return (
                                        <div key={k + '-' + i} className='col mb-3'>
                                            <div className="shadow-card dragCard" id={cardID}
                                                 onDragStart={self._dragCardStart} onDragEnd={self._onDragEnd}
                                                 draggable="true">
                                                <div className="card d-flex flex-row">
                                                    <div className="d-flex align-items-center padding-0">
                                                        <div className="thumbnail-cards m-bottom-0 border-0">
                                                            <img src={"./" + cards[cardID].thumbnail}
                                                                 className="disable-events thumbnail-image"/>
                                                        </div>
                                                    </div>
                                                    <div className='bg-light flex-grow-1 border-left p-2'>
                                                        <div className="container-fluid">
                                                            <div className="row vertical-align justify-content-between">
                                                                <div className="title">
                                                                    <h5 className="font-weight-bold mb-0">{cards[cardID].title}</h5>
                                                                </div>
                                                                <button
                                                                    className='btn btn-sm btn-empty'
                                                                    onClick={self._addCard(cardID)}>
                                                                    <i className="fa fa-plus"/>
                                                                </button>
                                                            </div>
                                                            <div className="row vertical-align">
                                                                <div className="flex-grow description">
                                                                    <h6>{cards[cardID].description}</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            </div>)
                        })
                    }
                </div>
            </div>
        );

    }
});

function mapStateToProps(state) {
    return {
        leftSideBarOpen: state.ui.leftSideBarOpen,
        leftSideBarTabIndex: state.ui.leftSideBarTabIndex,
        cards: state.cards,
        cardBeingDragged: state.ui.cardBeingDragged,
    };
}

module.exports = connect(mapStateToProps)(CardsSidebar);
