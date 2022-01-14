'use strict';
let View = require("./View");
let actionTypes = require("../actions/ActionTypes");
let connectionTypes = require('./../constants/ConnectionTypes');

class ViewsPanel {

    constructor() {
        this.views = [];
        this.lastViewId = 0;
    }

    setDispatch(dispatch) {
        this.dispatch = dispatch;
    }

    setWorkerSupervisor(workerSupervisor) {
        this.workerSupervisor = workerSupervisor;
    }

    init(nodeDOM, panelId) {
        this.lastViewId = 0;
        let self = this;
        this.views = [];
        this.gridNode = $(nodeDOM);
        this.panelId = panelId;
        let gridHTML = '<div class="grid-stack" style="margin-top:10px;">';
        gridHTML += '</div>';

        this.gridNode.empty();
        this.gridNode.append(gridHTML);
        this.gridNode.append(
            '<div class="drop-area-background">' +
            '  <div class="drop-area">' +
            '   <h1 class="display-1">' +
            '     <i class="far fa-clone"></i>' +
            '   </h1>' +
            '   <h1>Drop a visualization to add</h1>' +
            '  </div>' +
            '</div>');

        let availableHeight = document.body.clientHeight - 20 - 55;
        let maxNumberOfVisibleRows = 40;
        let rowHeight = Math.floor(availableHeight / maxNumberOfVisibleRows);

        this.gridNode.find('.grid-stack').gridstack(
            {
                width: 56,
                disableOneColumnMode: true,
                float: true,
                cellHeight: rowHeight,
                verticalMargin: 10, //TODO: horizontal margin programmatically (currently css)
                resizable: {
                    autoHide: false,
                    handles: 'e, se, s, sw, w'
                },
                handle: '.viz-panel-heading'
            }
        );

        this.dropAreaBackground = this.gridNode.find('.drop-area-background');
        this.dropArea = this.gridNode.find('.drop-area');

        //React wont remove the DOM element when changing between panels repeated listeners
        //TODO: cleanup html to remove parent drop
        let dropElem = $(this.dropArea);
        dropElem.on("drop", event => this._onDrop(event));
        dropElem.on("dragenter", event => this._onDragEnter(event));
        dropElem.on("dragover", event => this._onDragOver(event));
        this.dropAreaBackground.on("dragover", event => this._onDragOverBack(event));

        this.grid = this.gridNode.find('.grid-stack').data('gridstack');
        this.gridNode.find('.grid-stack').on('gsresizestop', function (event, elem) {
            let viewId = $(elem).find('.viz-panel').prop('_viewId');
            let viewPosition = self.views.findIndex(function (view) {
                return view.id == viewId;
            });
            self.views[viewPosition].view.render();
            self.saveLayout();
        });

        this.gridNode.find('.grid-stack').on('dragstop', function (event, elem) {
            self.saveLayout();
        });

        this.workerSupervisor.board.panels[panelId].visualizationIDs.forEach(function (cardId, i) {
            if (self.workerSupervisor.board.cards[cardId])
                self.addView(cardId, self.workerSupervisor.board.panels[panelId].layout[i]);
        });

        self.views.forEach(function (viewObj) {
            viewObj.view.initPlaceHolder();
        });

        setTimeout(function () {
            self.views.forEach(function (viewObj) {
                viewObj.view.init();
            })
        }, 100);

    }

    showDropZone() {
        $(this.dropAreaBackground).css("display", "block");
    }

    hideDropZone() {
        $(this.dropAreaBackground).css("display", "none");
        $(this.dropArea).css("color", "");
    }

    _onDrop(e) {
        let cardId = e.originalEvent.dataTransfer.getData("text");
        this.dispatch({
            type: actionTypes.ADD_VIZ_TO_PANEL,
            id: cardId,
            panelID: this.panelId
        });

        this.addView(cardId);
        this.views[this.views.length - 1].view.init();
    }

    _onDragOver(e) {
        e.preventDefault();
        $(this.dropArea).css("color", "#2a6fff");
    }

    _onDragOverBack(e) {
        e.preventDefault();
        $(this.dropArea).css("color", "");
    }

    _onDragEnter(e) {
        e.preventDefault();
    }

    destroy() {
        this.saveLayout();
        this.views.forEach(function (viewObj) {
                viewObj.view.unMount();
        });
        this.lastViewId = 0;
        this.views = [];
    }

    addView(cardId, position) {
        let viewId = this.lastViewId;
        this.lastViewId++;
        let viewHTML =
            '<div class="grid-stack-item">' +
            '  <div class="grid-stack-item-content viz-panel views-panel-view-' + viewId + '"></div>' +
            '  </div>' +
            '</div>';
        let widget;
        let isValidPosition = position !== undefined && !Number.isNaN(position.x) && !Number.isNaN(position.y)
            && !Number.isNaN(position.width) && !Number.isNaN(position.height);
        if (isValidPosition)
            widget = this.grid.addWidget(viewHTML, position.x, position.y, position.width, position.height);
        else
            widget = this.grid.addWidget(viewHTML, 0, 0, 16, 16, true);

        let selector = $('.views-panel-view-' + viewId);
        selector.prop("_viewId", viewId);
        this.views.push({
            view: new View(selector, cardId, viewId, this.setProperty(cardId), this.removeView(viewId)),
            widget: widget,
            id: viewId
        });
    }

    removeView(viewId) {
        let self = this;
        return function () {
            let viewPosition = self.views.findIndex(function (view) {
                return view.id == viewId;
            });
            self.workerSupervisor.board.panels[self.panelId].visualizationIDs.splice(viewPosition, 1);
            let removedView = self.views.splice(viewPosition, 1)[0];
            self.grid.removeWidget(removedView.widget);
            self.dispatch({type: actionTypes.REMOVE_VIZ_FROM_PANEL, panelID: self.panelId, vizIndex: viewPosition})
        }
    }

    updateVisualization(cardId) {
        this.views.forEach(function (viewObj) {
            if (viewObj.view.cardId == cardId)
                viewObj.view.update();

        })
    }

    saveLayout(elementData) {
        var layout = [];
        let self = this;
        this.views.map(function (view) {
            let elementData =  $(view.widget).data('_gridstack_node');
            layout.push({
                x: elementData.x,
                y: elementData.y,
                width: elementData.width,
                height: elementData.height
            })
        });
        this.dispatch({type: actionTypes.MOD_LAYOUT, id: this.panelId, layout: layout});
    }

    updateRelatedViews(cardId, property) {
        var self = this;
        this.workerSupervisor.board.cards[cardId].getAllChildren().forEach(function (connection) {
            if (connectionTypes.property[connection.type] === property)
                self.updateVisualization(connection.end);
        });
    }

    setProperty(cardId) {
        var self = this;
        return function (property, value) {
            self.workerSupervisor.setCardPropFromVizPanel(self.panelId, cardId, property, value);
            //self.updateRelatedViews(cardId, property);
        }
    }
}

module.exports = new ViewsPanel();