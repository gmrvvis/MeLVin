"use strict";

var React = require('react');

var connect = require("react-redux").connect;

var ActionTypes = require('../../actions/ActionTypes');

var MainNavBar = React.createClass({


    getInitialState: function () {
        return {showExpandedTabs: false, width: -1, numTabs: 1, page: 0, maxPages: 1}
    },

    _handleVizHide: function () {
        this.props.dispatch({type: ActionTypes.HIDE_VIZ});
        this.props.dispatch({type: ActionTypes.HIDE_VIZ_PANEL});
        this.props.dispatch({type: ActionTypes.HIDE_GRAMMAR_EDITOR});
    },

    _handleGrammarShow: function () {
        this.props.dispatch({type: ActionTypes.HIDE_VIZ});
        this.props.dispatch({type: ActionTypes.HIDE_VIZ_PANEL});
        this.props.dispatch({type: ActionTypes.SHOW_GRAMMAR_EDITOR});
    },

    _handleVizPanelShow: function (panelID) {
        this.props.dispatch({type: ActionTypes.HIDE_VIZ});
        this.props.dispatch({type: ActionTypes.HIDE_VIZ_PANEL});
        this.props.dispatch({type: ActionTypes.HIDE_GRAMMAR_EDITOR});
        this.props.dispatch({type: ActionTypes.SHOW_VIZ_PANEL, id: panelID});
    },

    _handleNavBarSwap: function (selectedNavBarIndex) {
        this.props.dispatch({type: ActionTypes.SELECT_NAVBAR_INDEX, index: selectedNavBarIndex});
    },

    onLeftBarVisibilityToggle: function () {
        this.props.dispatch({type: ActionTypes.SET_LEFT_SIDEBAR_STATE, state: !this.props.leftNavBarOpen});
    },

    onToggleExpandedTabs: function () {
        this.setState({showExpandedTabs: !this.state.showExpandedTabs})
    },

    componentDidMount() {
        if (this.props.currentSessionID !== -1) {
            var width = $(this.refs.tabs).width();
            let numTabs = Math.floor((width - 200) / 200);
            let maxPages = Math.ceil(this.props.panels.allIds.length / numTabs);
            this.setState({width: width, numTabs: numTabs, maxPages: maxPages});
        }
    },

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps && this.props.currentSessionID !== -1) {
            var width = $(this.refs.tabs).width();
            let numTabs = Math.floor((width - 200) / 200);
            let maxPages = Math.ceil(this.props.panels.allIds.length / numTabs);
            this.setState({width: width, numTabs: numTabs, maxPages: maxPages})
        }
    },


    addPanel() {
        this.props.dispatch({type: ActionTypes.ADD_PANEL, title: "VizPanel", id: this.props.panels.lastId});
        this._handleVizPanelShow(this.props.panels.lastId);
        this._handleNavBarSwap(this.props.panels.lastId);
    },

    showPanel(id) {
        this._handleVizPanelShow(id);
        this._handleNavBarSwap(id);
    },

    showPanelHideExpand(id) {
        this._handleVizPanelShow(id);
        this._handleNavBarSwap(id);
        this.onToggleExpandedTabs();
        this.setState({page: Math.floor(id / this.state.numTabs)})
    },

    removePanel(id) {
        this.props.dispatch({type: ActionTypes.REMOVE_PANEL, id: id})
    },

    prevTabPage() {
        if (this.state.page > 0) {
            this.setState({page: this.state.page - 1})
        }
    },

    nextTabPage() {
        if (this.state.page < (this.state.maxPages - 1)) {
            this.setState({page: this.state.page + 1})
        }
    },

    _togglePanelSidebar(panelID) {
        var self = this;
        return function () {
            self.props.dispatch({type: ActionTypes.TOGGLE_PANEL_SIDEBAR, panelID: panelID})
        }
    },

    render: function () {
        var self = this;

        var homeClass = this.props.selectedNavBarIndex === "home" ? "active" : "";
        var blueprintClass = this.props.selectedNavBarIndex === "blueprint" ? "active" : "";
        var grammarClass = this.props.selectedNavBarIndex === "grammar" ? "active" : "";
        var expandedTabs = <div></div>;
        var tabs = <li></li>;
        if (this.state.showExpandedTabs) {
            expandedTabs = (
                <div className="tab-expand">
                    <ul>
                        {
                            this.props.panels.allIds.map(function (panelID, i) {
                                var panel = self.props.panels.byId[panelID];
                                var className = self.props.selectedNavBarIndex === panel.id ? "active" : "";
                                return (
                                    <li className={className}><a style={{width: "300px"}}>
                                        <span style={{flexGrow: 1}} onClick={
                                            function () {
                                                self.showPanelHideExpand(panel.id)
                                            }
                                        }>{" " + panel.title + " " + panel.id}</span>
                                        <span className="fa fa-times pl-3" style={{flex: "none"}}
                                              onClick={
                                                  function () {
                                                      self.removePanel(panel.id)
                                                  }
                                              }/>
                                    </a>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            )
        }

        if (this.state.numTabs > 1) {
            tabs = [];
            let tabsLeft = Math.min(this.state.numTabs, this.props.panels.allIds.length - (this.state.numTabs * this.state.page));
            for (var i = 0; i < tabsLeft; i++) {
                var panel = this.props.panels.byId[this.props.panels.allIds[i + (this.state.page * this.state.numTabs)]];
                var className = self.props.selectedNavBarIndex === panel.id ? "active" : "";
                const id = panel.id;

                if (self.props.selectedNavBarIndex === panel.id) {
                    tabs.push(
                        <li className={className}>
                            <a href="#" style={{width: "190px"}} className="d-flex justify-content-between"
                               onClick={this._togglePanelSidebar(id)}>
                                <div>
                                    <span className="fa fa-poll" style={{marginRight: "4px"}}/>
                                    <span>{" " + panel.title + " " + panel.id}</span>
                                </div>
                                <i className="fa fa-cog"/>
                            </a>
                        </li>
                    )
                } else {
                    tabs.push(
                        <li className={className}>
                            <a href="#" style={{width: "190px"}} onClick={
                                function () {
                                    self.showPanel(id)
                                }
                            }
                            >
                                <span className="fa fa-poll"/>
                                <span>{" " + panel.title + " " + panel.id}</span>
                            </a>
                        </li>
                    )
                }
            }
        }

        var prevButtonClass = this.state.page === 0 ? "no_tab vis_hidden" : "no_tab";
        var nextButtonClass = (this.state.page + 1) === this.state.maxPages ? "no_tab vis_hidden" : "no_tab";
        var sessionTitle = "";
        this.props.sessions.forEach(function (session) {
            if (session.id === self.props.currentSessionID) sessionTitle = session.title;
        });


        var sectionTabs;
        var panelTabs;
        var layoutTab;
        var grammarTab;
        var appNameBadge;


        if (this.props.currentSessionID !== -1) {
            appNameBadge = (
                <div className="navbar-app-name">
                    <span className="app-name-badge">{sessionTitle}</span>
                </div>
            );

            layoutTab = (
                <li className={blueprintClass}>
                    <a href="#" onClick={
                        function () {
                            self._handleVizHide();
                            self._handleNavBarSwap("blueprint");
                        }
                    }
                    >
                        <span className="fa fa-clone"/>
                        {"DFD Layout"}
                    </a>
                </li>
            );

            grammarTab = (
                <li className={grammarClass}>
                    <a href="#" onClick={
                        function () {
                            self._handleGrammarShow();
                            self._handleNavBarSwap("grammar");
                        }
                    }
                    >
                        <span className="fa fa-align-left"> </span>
                        {"Grammar"}
                    </a>
                </li>
            );

            panelTabs =
                <ul className="nav-tab border-r"
                    style={{flexGrow: 1, paddingLeft: "16px", backgroundColor: "#2c3137", justifyContent: "center"}}
                    ref="tabs">
                    <li className={prevButtonClass}>
                        <a href="#" onClick={this.prevTabPage}>
                            <i className="fa fa-chevron-left"/>
                        </a>
                    </li>
                    {tabs}
                    <li>
                        <a href="#" onClick={this.addPanel}>
                            <i className="fa fa-plus" style={{marginRight: "0px"}}/>
                        </a>
                    </li>
                    <li className={nextButtonClass}>
                        <a href="#" onClick={this.nextTabPage}>
                            <i className="fa fa-chevron-right"/>
                        </a>
                    </li>
                    <li className="no_tab">
                        <a href="#" onClick={this.onToggleExpandedTabs} style={{borderRight: "none"}}>
                            <i className="fa fa-ellipsis-h"/>
                        </a>
                    </li>
                </ul>
        }

        sectionTabs = (
            <ul className="nav-tab border-r nav-shadow">
                {layoutTab}
                {/*{grammarTab}*/}
            </ul>
        );


        return (
            <nav className="navbar-secondary">
                <div className="navbar-logo" onClick={
                    function () {
                        self._handleVizHide();
                        self._handleNavBarSwap("home");
                        self.props.dispatch({type: ActionTypes.SET_HOME_SECTION, section: "Home"});
                    }
                }>
                    <ul className="nav-tab border-r logo">
                        <li className={homeClass}>
                            <a href="#">
                                <span className="fa fa-house" style={{marginRight: "0"}}/></a>
                        </li>
                    </ul>
                    <span className="pl-3"><span style={{fontSize: "16px", lineHeight: "16px"}}>MeLVin</span></span>
                </div>
                {appNameBadge}
                {panelTabs}
                {sectionTabs}
                {expandedTabs}
            </nav>
        )
    }
});

function mapStateToProps(state) {
    return {
        progress: 0,
        username: "Default",
        cards: state.cards,
        panels: state.panels,
        showViz: false,
        selectedNavBarIndex: state.ui.selectedNavBarIndex,
        currentSessionID: state.ui.currentSessionID,
        sessions: state.ui.sessions
    };
}


module.exports = connect(mapStateToProps)(MainNavBar);