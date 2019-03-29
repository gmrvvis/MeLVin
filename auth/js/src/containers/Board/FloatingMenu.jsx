'use strict';

var React = require('react');
var ConnectionList = require('./ConnectionList');
var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var ConnectionTypes = require('./../../constants/ConnectionTypes');
var CardInfoMenu = require('./InfoSidebar');
var CardsListMenu = require('./CardsSidebar');
var LayersMenu = require('./LayersSidebar/LayersSidebar');

var FloatingMenu = React.createClass({

    closeMenu: function () {
        this.props.dispatch({type: ActionTypes.SET_FLOATING_MENU_INDEX, index: -1});
    },

    openMenu: function (index) {
        var self = this;
        return function () {
            if (self.props.floatingMenuIndex === index)
                self.props.dispatch({type: ActionTypes.SET_FLOATING_MENU_INDEX, index: -1});
            else
                self.props.dispatch({type: ActionTypes.SET_FLOATING_MENU_INDEX, index: index});
        }
    },

    render: function () {
        var self = this;
        var buttons = [
            {action: this.openMenu(0), iconClass: 'fa fa-clone', text: 'Cards'},
            {action: this.openMenu(1), iconClass: 'fa fa-sliders-h', text: 'Options'},
        ];

        var content;
        switch (this.props.floatingMenuIndex) {
            case 0:
                content = (
                    <div className="floating-menu">
                        <CardsListMenu/>
                    </div>
                );
                break;
            case 1:
                content = (
                    <div className="floating-menu">
                        <CardInfoMenu/>
                    </div>
                );
                break;
        }

        var closeBtn;
        if (this.props.floatingMenuIndex !== -1) {
            closeBtn = (
                <div className="floating-close" onClick={this.closeMenu}>
                    <i className="fa fa-times"/>
                </div>
            );
        }

        return (
            <div className="floating-menu-wrapper">
                {closeBtn}
                {content}
                <div className="toolbar toolbar-right ">
                    <ul>
                        {
                            buttons.map(function (button, i) {
                                var buttonClass = "toolbar-item";
                                if (i === self.props.floatingMenuIndex)
                                    buttonClass += " active";
                                return (
                                    <li className={buttonClass} onClick={button.action}>
                                        <div className="menu-icon">
                                            <i className={button.iconClass}/>
                                            <span>{button.text}</span>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        )
    }
});

function mapStateToProps(state) {
    return {
        floatingMenuVisible: state.ui.floatingMenuVisible,
        floatingMenuIndex: state.ui.floatingMenuIndex
    };
}

module.exports = connect(mapStateToProps)(FloatingMenu);
