var vizParams = require('../auth/js/src/constants/CardsSchema');
var skeleton = {
    cards: {byId: {}, allIds: [], lastId: 0},
    connections: {byId: {}, allIds: [], highlighted: []},
    panels: {byId: {}, allIds: [], lastId: 0},
    options: {},
    layouts: {},
    ui: {
        lastCardID: 0,
        selectedCard: -1,
        tables: {},
        schemas: {},
        rightSideBarOpen: true,
        leftSideBarOpen: true,
        leftSideBarTabIndex: 0,
        rightSideBarTabIndex: 0,
        showViz: false,
        selectedVizCardID: -1,
        sessionID: "",
        showVizPanel: false,
        selectedVizPanelID: -1,
        layout: [],
        selectedNavBarIndex: "home",
        cardBeingDragged: false,
        translate: [0, 0],
        scale: 0,
        connection: null,
        progress: 0,
        files: [],
        libFiles: [],
        previewFiles: [],
        socket: null,
        showFileList: false,
        showVizList: false,
        cardsSchema: typeof vizParams !== "undefined" ? Object.assign({}, vizParams.cards) : {},
        showVizCreator: false,
        showCardCreator: false,
        customViz: {},
        customVizNames: [],
        showFileUpload: false,
        showGrammarEditor: false,
        loading: true,
        loadingMessage: "Initializing MeLVin",
        startWork: [],
        workFinished: [],
        lastAction: "",
        leftNavBarOpen: true,
        showCardCreatorTypeSelector: false,
        currentSessionID: -1
    },
    grammar: {showGrammarEditor: false},
    cardCreatorSchema: {
        step: 1,
        stepState: {
            "1": {openLeft: 0, openRight: 0},
            "2": {},
            "3": {open: 0},
            "4": {open: 0},
            "5": {open: 0, options: []}
        },
        schema: {
            title: "",
            description: "",
            type: "javascript",
            allowOutConn: true,
            allowInConn: true,
            outConnections: [],
            inConnections: [],
            shareSelection: false,
            shareData: true,
            category: "card",
            selectedLibs: [],
            previewDataFile: "",
            selectedPreview: "",
            method: {
                code: "",
                args: [{name: "state", value: "state"}, {name: "setResult", value: "setResult"}, {name: "setProgress", value: "setProgress"}]
            },
            options: []
        },
        canBeLoaded: false
    },
    visualizationCreatorSchema: {
        step: 1,
        stepState: {
            "1": {openLeft: 0, openRight: 0},
            "2": {},
            "3": {open: 0},
            "4": {open: 0},
            "5": {open: 0, options: []}
        },
        schema: {
            title: "",
            description: "",
            className: "",
            allowOutConn: true,
            allowInConn: true,
            outConnections: [],
            inConnections: [],
            shareSelection: false,
            shareData: true,
            category: "viz",
            selectedLibs: [],
            previewDataFile: "",
            selectedPreview: "",
            methods: {
                init: {code: "", args: [], isRemovable: true, hasCustomArgs: true, canBeRenamed: false},
                resize: {code: "", args: [], isRemovable: false, hasCustomArgs: true, canBeRenamed: false},
                render: {code: "", args: [], isRemovable: false, hasCustomArgs: true, canBeRenamed: false},
                update: {
                    code: "", args: [{name: "currentProps", value: "currentProps"},
                        {name: "nextProps", value: "nextProps"}],
                    isRemovable: false, hasCustomArgs: false, canBeRenamed: false
                },
            },
            options: []
        },
        canBeLoaded: false
    }
};

module.exports = skeleton;