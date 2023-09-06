var actionTypes = require('../actions/ActionTypes');
var vizParams = require('../constants/CardsSchema');
var notRelodable = ["files", "libFiles", "previewFiles", "sessions"];
var initialState = {
    selectedCard: -1,
    tables: {},
    schemas: {},
    blueprintSideBarOpen: true,
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
    showConnCreator: false,
    customViz: {},
    customVizNames: [],
    showFileUpload: false,
    showGrammarEditor: false,
    loading: true,
    loadingMessage: "Initializing MeLVin",
    startWork: [],
    workFinished: [],
    lastAction: "",
    leftNavBarOpen: false,
    showCardCreatorTypeSelector: false,
    currentSessionID: -1,
    sessions: [],
    floatingMenuVisible: false,
    floatingMenuIndex: -1,
    hiddenConnections: [],
    hiddenAlpha: 0,
    homeSection: "Home",
    username: "",
    globalMessage: {description: "", title: "", category: -1},
    showGlobalMessage: false,
    showGlobalWorkingMessage: false,
    currentlyWorkingIds: [],
    width: document.body.clientWidth,
    height: document.body.clientHeight,
    showGlobalErrorMessage: false,
    globalErrorMessage: "",
    showOptionsLB: false,
    optionsLBCardId: -1
};

function userInterface(state, action) {
    state = state || initialState;

    switch (action.type) {

        case actionTypes.RESIZE_UI:
            return Object.assign({}, state, {width: action.width, height: action.height});

        case actionTypes.ADD_HIDDEN_CONNECTION:
            var hiddenConnections = state.hiddenConnections.concat([]);
            hiddenConnections.push(action.connType);
            return Object.assign({}, state, {hiddenConnections: hiddenConnections});

        case actionTypes.REMOVE_HIDDEN_CONNECTION:
            var hiddenConnections = state.hiddenConnections.concat([]);
            hiddenConnections = hiddenConnections.filter(function (connectionType) {
                return connectionType !== action.connType;
            });
            return Object.assign({}, state, {hiddenConnections: hiddenConnections});

        case actionTypes.ALPHA_HIDDEN_CONNECTION:
            return Object.assign({}, state, {hiddenAlpha: action.alpha});

        case actionTypes.SESSION_UNLOAD:
            return Object.assign({}, state, {currentSessionID: -1});

        case actionTypes.SET_CURRENT_SESSION_ID:
            return Object.assign({}, state, {currentSessionID: action.id});

        case actionTypes.HIDE_FULL_LOADING:
            return Object.assign({}, state, {loading: false});

        case actionTypes.SET_FULL_LOADING_MESSAGE:
            return Object.assign({}, state, {loadingMessage: action.message});

        case actionTypes.UPDATE_USERNAME:
            return Object.assign({}, state, {username: action.username});

        case actionTypes.OPEN_LEFT_SIDEBAR:
            return Object.assign({}, state, {leftSideBarOpen: true});

        case actionTypes.CLOSE_LEFT_SIDEBAR:
            return Object.assign({}, state, {leftSideBarOpen: false});

        case actionTypes.TOGGLE_LEFT_SIDEBAR:
            return Object.assign({}, state, {leftSideBarOpen: !state.leftSideBarOpen});

        case actionTypes.OPEN_RIGHT_SIDEBAR:
            return Object.assign({}, state, {rightSideBarOpen: true});

        case actionTypes.CLOSE_RIGHT_SIDEBAR:
            return Object.assign({}, state, {rightSideBarOpen: false});

        case actionTypes.TOGGLE_RIGHT_SIDEBAR:
            return Object.assign({}, state, {rightSideBarOpen: !state.rightSideBarOpen});

        case actionTypes.OPEN_BLUEPRINT_SIDEBAR:
            return Object.assign({}, state, {blueprintSideBarOpen: true});

        case actionTypes.CLOSE_BLUEPRINT_SIDEBAR:
            return Object.assign({}, state, {blueprintSideBarOpen: false});

        case actionTypes.TOGGLE_BLUEPRINT_SIDEBAR:
            return Object.assign({}, state, {blueprintSideBarOpen: !state.blueprintSideBarOpen});

        case actionTypes.SHOW_FLOATING_MENU:
            return Object.assign({}, state, {
                floatingMenuVisible: true,
                floatingMenuIndex: action.index !== undefined ? action.index : -1
            });

        case actionTypes.HIDE_FLOATING_MENU:
            return Object.assign({}, state, {floatingMenuVisible: false});

        case actionTypes.SET_FLOATING_MENU_INDEX:
            return Object.assign({}, state, {floatingMenuIndex: action.index});

        case actionTypes.OPEN_TAB_LEFT_SIDEBAR:
            return Object.assign({}, state, {leftSideBarTabIndex: action.index});

        case actionTypes.OPEN_TAB_RIGHT_SIDEBAR:
            return Object.assign({}, state, {rightSideBarTabIndex: action.index});

        case actionTypes.SHOW_VIZ:
            return Object.assign({}, state, {showViz: true, selectedVizCardID: action.id});

        case actionTypes.HIDE_VIZ:
            return Object.assign({}, state, {showViz: false});

        case actionTypes.SHOW_FILE_UPLOAD:
            return Object.assign({}, state, {showFileUpload: true});

        case actionTypes.HIDE_FILE_UPLOAD:
            return Object.assign({}, state, {showFileUpload: false});

        case actionTypes.SHOW_VIZ_PANEL:
            return Object.assign({}, state, {showVizPanel: true, selectedVizPanelID: action.id});

        case actionTypes.HIDE_VIZ_PANEL:
            return Object.assign({}, state, {showVizPanel: false});

        case actionTypes.SELECT_NAVBAR_INDEX:
            return Object.assign({}, state, {selectedNavBarIndex: action.index});

        case actionTypes.START_CARD_DRAGGING:
            return Object.assign({}, state, {cardBeingDragged: true});

        case actionTypes.STOP_CARD_DRAGGING:
            return Object.assign({}, state, {cardBeingDragged: false});

        case actionTypes.SCALE:
            return Object.assign({}, state, {scale: action.scale});

        case actionTypes.TRANSLATE:
            return Object.assign({}, state, {translate: action.translate});

        case actionTypes.SELECT_CARD:
            return Object.assign({}, state, {selectedCard: action.id});

        case actionTypes.REMOVE_CARD:
            if (action.id === state.selectedCard)
                return Object.assign({}, state, {selectedCard: -1});
            else
                return state

        case actionTypes.SHOW_PROGRESS:
            return Object.assign({}, state, {progress: action.progress});

        case actionTypes.UPDATE_FILE_LIST:
            return Object.assign({}, state, {files: action.files});

        case actionTypes.SHOW_FILE_LIST:
            return Object.assign({}, state, {showFileList: true});

        case actionTypes.HIDE_FILE_LIST:
            return Object.assign({}, state, {showFileList: false});

        case actionTypes.SHOW_VIZ_LIST:
            return Object.assign({}, state, {showVizList: true});

        case actionTypes.HIDE_VIZ_LIST:
            return Object.assign({}, state, {showVizList: false});

        case actionTypes.HIDE_CARD_SELECTOR:
            return Object.assign({}, state, {showCardCreatorTypeSelector: false});

        case actionTypes.SHOW_CARD_SELECTOR:
            return Object.assign({}, state, {showCardCreatorTypeSelector: true});

        case actionTypes.HIDE_CONN_CREATOR:
            return Object.assign({}, state, {showConnCreator: false});

        case actionTypes.SHOW_CONN_CREATOR:
            return Object.assign({}, state, {showConnCreator: true});

        case actionTypes.SET_LEFT_SIDEBAR_STATE:
            return Object.assign({}, state, {leftNavBarOpen: action.state});

        case actionTypes.UPDATE_VIZ_LIST:
            state.cardsSchema = Object.assign({}, vizParams.cards);
            state.customVizNames = Object.keys(vizParams.names);
            return Object.assign({}, state);

        case actionTypes.UPDATE_LIB_LIST:
            return Object.assign({}, state, {libFiles: action.files});

        case actionTypes.UPDATE_PREVIEW_LIST:
            return Object.assign({}, state, {previewFiles: action.files});

        case actionTypes.SESSION_INIT:

            var libFiles = action.workspace.libFiles ? Object.assign({}, action.workspace.libFiles) : state.libFiles;
            var previewFiles = action.workspace.previewFiles ? action.workspace.previewFiles.concat() : state.previewFiles;
            var files = action.workspace.dataFiles ? action.workspace.dataFiles : state.files;
            var sessions = action.workspace.sessions ? action.workspace.sessions : state.sessions;

           // TODO: improve file handling
            window.files = files;

            return Object.assign({}, state, {
                libFiles: libFiles,
                previewFiles: previewFiles,
                files: files,
                sessions: sessions
            });

        case actionTypes.SESSION_LIST_RELOAD:
            var sessions = action.workspace.sessions ? action.workspace.sessions : state.sessions;
            return Object.assign({}, state, {sessions: sessions});

        case actionTypes.RESET_UI:
            var newState = Object.assign({}, initialState);
            notRelodable.forEach(function (prop) {
                newState[prop] = state[prop];
            });
            newState.selectedNavBarIndex = "blueprint";
            newState.showVizPanel = false;
            newState.showViz = false;
            newState.loading = false;
            newState.currentSessionID = action.id;
            return newState;


        case actionTypes.SET_HOME_SECTION:
            return Object.assign({}, state, {homeSection: action.section});

        case actionTypes.SHOW_MESSAGE:
            return Object.assign({}, state,
                {showGlobalMessage: true, globalMessage: Object.assign({}, action.message)});

        case actionTypes.HIDE_MESSAGE:
            return Object.assign({}, state, {showGlobalMessage: false});

        case actionTypes.SHOW_WORKING_MESSAGE:
            return Object.assign({}, state, {
                showGlobalWorkingMessage: true,
                currentlyWorkingIds: action.currentlyWorkingIds
            });

        case actionTypes.HIDE_WORKING_MESSAGE:
            return Object.assign({}, state, {showGlobalWorkingMessage: false, currentlyWorkingIds: []});

        case actionTypes.SHOW_ERROR_MESSAGE:
            return Object.assign({}, state, {showGlobalErrorMessage: true, globalErrorMessage: action.message});

        case actionTypes.HIDE_ERROR_MESSAGE:
            return Object.assign({}, state, {showGlobalErrorMessage: false, globalErrorMessage: ""});

        case actionTypes.OPTION_HIDE_LB:
            return Object.assign({}, state, {showOptionsLB: false});

        case actionTypes.OPTION_SHOW_LB:
            return Object.assign({}, state, {showOptionsLB: true, optionsLBCardId: action.id});

        default:
            return state
    }
}

module.exports = userInterface;