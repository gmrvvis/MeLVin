'use strict';

var React = require('react');
var RightSidebar = require('../Board/InfoSidebar');
var LeftSidebar = require('../Board/CardsSidebar');
var BlueprintSidebar = require('../Board/LayersSidebar/LayersSidebar');
var Board = require('../Board/Board');
var MultiVisualization = require('../VisualizationPanel/VisualizationPanel');
var GrammarEditor = require('../GrammarEditor/GrammarEditor');
var VisualizationSidebar = require('../VisualizationPanel/VisualizationSidebar');
var Home = require('../Dashboard/Home');
var ActionTypes = require('../../actions/ActionTypes');
var connect = require("react-redux").connect;
var BottomLayers = require('../Board/BottomLayers');
var Files = require('../Dashboard/Files/Files');
var Dependencies = require('../Dashboard/Files/Dependencies/Dependencies');
var Thumbnails = require('../Dashboard/Files/Thumbnails');

var ProccesingCards = require('../Dashboard/Components/ProcessingCards');
var VisualizationCards = require('../Dashboard/Components/VisualizationCards');
var Connections = require('../Dashboard/Components/Connections');
var Designs = require('../Dashboard/Designs/Designs');
var VisualziationCreator = require('../VisualizationBuilder/LightBoxContainer');
var CardCreator = require('../CardBuilder/LightBoxContainer');
var ConnectionCreator = require('../ConnectionCreator/LightBoxContainer');
var FloatingMenu = require('../Board/FloatingMenu');
var OptionsLB = require('../OptionLightBox/OptionsLB');

var Content = React.createClass({


    render: function () {
        var blueprintContent;

        if (this.props.selectedNavBarIndex === "home") {
            if (this.props.homeSection === "Home")
                blueprintContent = <Home/>;
            else if (this.props.homeSection === "Designs")
                blueprintContent = <Designs/>;
            else if (this.props.homeSection === "ProcessingList")
                blueprintContent = <ProccesingCards/>;
            else if (this.props.homeSection === "VisualizationList")
                blueprintContent = <VisualizationCards/>;
            else if (this.props.homeSection === "ConnectionList")
                blueprintContent = <Connections/>;
            else if (this.props.homeSection === "FilesList")
                blueprintContent = <Files/>;
            else if (this.props.homeSection === "DependenciesList")
                blueprintContent = <Dependencies/>;
            else if (this.props.homeSection === "ThumbnailsList")
                blueprintContent = <Thumbnails/>;
            else if (this.props.homeSection === "VisualizationCreator")
                blueprintContent = <VisualziationCreator/>;
            else if (this.props.homeSection === "ProcessingCreator")
                blueprintContent = <CardCreator/>;
            else if (this.props.homeSection === "ConnectionCreator")
                blueprintContent = <ConnectionCreator/>;
        }
        else if (this.props.selectedNavBarIndex === "blueprint") {
            blueprintContent = (
                <div>
                    <div className="h-100">
                        <div className="h-100">
                            <OptionsLB/>
                            <Board/>
                            <FloatingMenu/>
                            <BottomLayers/>
                        </div>
                    </div>
                </div>
            );
        }
        else if (this.props.selectedNavBarIndex === "grammar") {
            blueprintContent = (
                <GrammarEditor/>
            );
        }
        //TODO: review correctness
        else {
            blueprintContent = (
                <div className="visualization">
                    <MultiVisualization selectedVizPanelID = {this.props.selectedVizPanelID}/>
                    <VisualizationSidebar/>
                </div>
            );
        }

        return (
            <div className="blueprint h-100 overflow-y">
                {blueprintContent}
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        selectedVizPanelID: state.ui.selectedVizPanelID,
        selectedNavBarIndex: state.ui.selectedNavBarIndex,
        homeSection: state.ui.homeSection
    };
}


module.exports = connect(mapStateToProps)(Content);
