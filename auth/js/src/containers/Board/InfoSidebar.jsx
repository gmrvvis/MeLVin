'use strict';

var React = require('react');
var ConnectionList = require('./ConnectionList');
var Options = require('../Options/Options');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var ConnectionTypes = require('./../../constants/ConnectionTypes');

var InfoSidebar = React.createClass({

    getInitialState: function () {
        return {
            editingTitle: false,
            newTitle: ""
        }
    },

    _onOpenEditText: function () {
        this.setState({editingTitle: true, newTitle: this.props.cards.byId[this.props.selectedCard].title})
    },

    _onCancelEditTitle: function () {
        this.setState({editingTitle: false, newTitle: ""})
    },

    _onChangeTitle: function (event) {
        this.setState({newTitle: event.target.value});
    },

    _onSaveTitle: function () {
        let id =  this.props.selectedCard;
        this.props.dispatch({type: ActionTypes.SET_CARD_PROP, value: this.state.newTitle, id: id, prop: "title"});
        this.setState({editingTitle: false, newTitle: ""})
    },

    _openTab: function (index) {
        this.props.dispatch({type: ActionTypes.OPEN_TAB_RIGHT_SIDEBAR, index: index})
    },

    _handleRemoveConn: function (ids) {
        if (ids !== undefined && ids !== null && ids.length > 0)
            this.props.dispatch({type: ActionTypes.REMOVE_CONNECTION, ids: ids});
    },

    _highlightConnection: function (ids) {
        if (ids !== undefined && ids !== null && ids.length > 0)
            this.props.dispatch({type: ActionTypes.HIGHLIGHT_CONNECTION, ids: ids})
    },

    _unHighlightConnection: function (ids) {
        if (ids !== undefined && ids !== null && ids.length > 0)
            this.props.dispatch({type: ActionTypes.UNHIGHLIGHT_CONNECTION, ids: ids})
    },

    _closeRightNav: function () {
        this.props.dispatch({type: ActionTypes.CLOSE_RIGHT_SIDEBAR});
    },

    render: function () {
        var selectedID = this.props.selectedCard;
        var selectedCard = this.props.cards.byId[selectedID];

        if (selectedID >= 0 && typeof selectedCard !== "undefined") {

            var self = this;
            var sidebarClass = "col-3 sidebar-right container-fluid";
            var options = this.props.options[this.props.selectedCard];
            var hasOptions = (options !== undefined && options.length && options.length > 0)
                || selectedCard.type === 'data_input'
                || selectedCard.type === 'options';
            var openTabIndex = hasOptions ? this.props.rightSideBarTabIndex : 0;
            if (this.props.rightSideBarOpen && !this.props.cardBeingDragged) sidebarClass += " open-right";

            var childConnectionsByType = {};
            var childConnectionsIds = [];
            var parentConnectionsByType = {};
            var parentConnectionsIds = [];

            ConnectionTypes.types.forEach(function (type) {
                childConnectionsByType[type] = [];
                parentConnectionsByType[type] = [];
            });

            this.props.connections.allIds.forEach(function (id) {
                var conn = self.props.connections.byId[id];
                if (conn.start === selectedID) {
                    childConnectionsByType[conn.type].push(conn);
                    childConnectionsIds.push(conn.id);
                } else if (conn.end === selectedID) {
                    parentConnectionsByType[conn.type].push(conn);
                    parentConnectionsIds.push(conn.id);
                }
            });


            var tabs = [{
                id: "conn", title: "Connections", content: (
                    <div className='col-lg-12 mt-3'>

                        <ConnectionList title="Incoming Connections"
                                        highlightHandler={this._highlightConnection}
                                        unHighlightHandler={this._unHighlightConnection}
                                        removeHandler={this._handleRemoveConn}
                                        cards={this.props.cards}
                                        connections={selectedID}
                                        connectionsByType={parentConnectionsByType}
                                        connectionsIds={parentConnectionsIds}
                                        destinationProp={"start"}
                                        selectedID={selectedID}
                                        incoming={true}
                        />

                        <ConnectionList title={"Outgoing Connections"}
                                        selectionType="children"
                                        highlightHandler={this._highlightConnection}
                                        unHighlightHandler={this._unHighlightConnection}
                                        removeHandler={this._handleRemoveConn}
                                        cards={this.props.cards}
                                        connections={selectedID}
                                        connectionsByType={childConnectionsByType}
                                        connectionsIds={childConnectionsIds}
                                        destinationProp={"end"}
                                        selectedID={selectedID}
                                        incoming={false}
                        />
                    </div>
                )
            }];

            if (hasOptions) {
                tabs.unshift(
                    {
                        id: "config", title: "Options", content: (
                            <Options selectedCard={selectedID}/>
                        )
                    }
                )
            }

            let title;

            if (!this.state.editingTitle) {
                title = (
                    <div className="mt-4 mb-4 d-flex align-items-center justify-content-center">
                        <h4 className="mr-2">{selectedCard.title}</h4>
                        <h6 className="fa fa-pencil-alt" onClick={this._onOpenEditText}></h6>
                    </div>
                )
            } else {
                title = (
                    <div className="mt-4 mb-4 d-flex align-items-center justify-content-center">
                        <div className="input-group pl-2">
                            <input type="text"
                                   className="form-control"
                                   spellCheck="false" value={this.state.newTitle}
                                   onChange={this._onChangeTitle}/>
                            <div className="input-group-append">
                                <button key="0"
                                        type="button"
                                        className="btn btn-outline-success"
                                        onClick={this._onSaveTitle}>
                                    <span className="fa fa-check-circle"/>
                                </button>
                                <button key="1"
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={this._onCancelEditTitle}>
                                    <span className="fa fa-times-circle"/>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            return (
                <div className="d-flex flex-column" style={{height: "100%"}}>
                    <div className="row-gray">
                        {title}
                        <ul className="nav nav-tabs nav-fill">
                            {
                                tabs.map(function (tab, i) {
                                    var classes = openTabIndex === i ? "nav-link active" : "nav-link";
                                    return (
                                        <li key={i} className="nav-item">
                                            <a href={"#" + tab.id} className={classes} onClick={function () {
                                                self._openTab(i)
                                            }}>
                                                {tab.title}
                                            </a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="container tab-content scroll-y">
                        <div className="row tab-pane h-100 active">
                            {tabs[openTabIndex].content}
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="col-12 d-flex align-items-center justify-content-center">
                    <div className="alert alert-info">
                        <h5 className="text-center">Select a card to view its options.</h5>
                    </div>
                </div>
            );
        }
    }
});


function mapStateToProps(state) {
    return {
        cards: state.cards,
        connections: state.connections,
        options: state.options,
        selectedCard: state.ui.selectedCard,
        rightSideBarOpen: state.ui.rightSideBarOpen,
        rightSideBarTabIndex: state.ui.rightSideBarTabIndex,
        cardBeingDragged: state.ui.cardBeingDragged
    };
}

module.exports = connect(mapStateToProps)(InfoSidebar);
