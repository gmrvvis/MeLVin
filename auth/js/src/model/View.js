'use strict';

let workerSupervisor = require('./WorkerSupervisor');
let ConnectionTypes = require('./../constants/ConnectionTypes');
let Options = require('./VisualOption/ReactOptionsWrapper');
let vizParams = require('../constants/CardsSchema');

class View {

    constructor(nodeDOM, cardId, viewId, setProperty, destroy) {
        this.nodeDOM = nodeDOM;
        this.viewId = viewId;
        this.cardId = cardId;
        this.type = workerSupervisor.board.cards[cardId].type;
        this.viewClass = undefined;
        this.viewProperties = new Array(4);
        this.setProperty = setProperty;
        this.optionsVisible = false;
        this.hasOptions = vizParams.cards[this.type].hasOptions;

        var optionsButton = '';
        if (this.hasOptions)
            optionsButton =
                ' <button class="btn btn-primary btn-options">' +
                '  <i class="fa fa-cog"/>' +
                ' </button>';

        $(nodeDOM).append(
            '<div class="viz-panel-heading">' +
            '<div class="d-flex">' +
            ' <span class="font-weight-bold title">' +
            workerSupervisor.board.cards[cardId].title + ' - ' + cardId +
            ' </span>' +
            ' <div class="btn-edit-title">' +
            '  <i class="fa fa-pen"/>' +
            ' </div>' +
            '</div>' +
            '<div>' +
            optionsButton +
            ' <button class="btn btn-danger btn-remove">' +
            '  <i class="fa fa-times"/>' +
            ' </button>' +
            '</div>' +
            '</div>' +
            '<div class="viz-panel-body"></div>' +
            '<div class="viz-panel-options">' +
            '</div>'
        );

        this.container = $(nodeDOM).find('.viz-panel-body');
        this.optionsContainer = $(nodeDOM).find('.viz-panel-options');
        this.options;
        this.destroy = destroy;
    }

    showError(e) {
        $(this.container).empty();
        $(this.container).append(
            '<div class="h-100 w-100 d-flex align-items-center justify-content-center flex-column">' +
            ' <div class="alert alert-danger" role="alert">' +
            '  Something went wrong' +
            ' </div>' +
            ' <div class="alert alert-danger" role="alert">' +
            e.name + ": " + e.message +
            ' </div>' +
            '</div>');

    }

    initPlaceHolder() {
        $(this.container).empty();
        $(this.container).append(
            ' <div class="h-100 w-100 d-flex align-items-center justify-content-center">' +
            '  <i class="fa fa-spinner fa-spin" style="font-size:48px"/>' +
            '  <h2>Loading visualization...</h2>' +
            ' </div>');
    }

    init() {
        try {
            this.isOptionView = this.type === 'options';
            this.viewClass = new window[vizParams.names[this.type]](undefined);
            this.render();
            this.renderOptions();
            this.attachListeners();
        } catch (e) {
            this.showError(e);
        }
    }

    attachListeners() {
        var self = this;

        $(this.nodeDOM).find('.btn-options').on('click', function () {
            self.toggleOptions();
        });

        $(this.nodeDOM).find('.btn-remove').on('click', function () {
            self.unMount();
            self.destroy();
        });
    }

    renderOptions() {
        if (this.hasOptions)
            try {
                this.options = new Options($(this.optionsContainer), this.cardId);
                this.options.render();
            } catch (e) {
                this.showError(e);
            }
    }

    toggleOptions() {
        if (this.optionsVisible)
            $(this.optionsContainer).css("right", "-350px");
        else
            $(this.optionsContainer).css("right", 0);
        this.optionsVisible = !this.optionsVisible;
    }

    render() {
        let self = this;
        try {
            this.generateProps().then(function () {
                if (self.viewProperties[1].data
                    && (self.viewProperties[1].data.data === undefined || self.viewProperties[1].data.data.length === 0))
                    self.setDataError();
                else
                    self.call("init");
            });
        } catch (e) {
            this.showError(e);
        }
    }

    update() {
        let self = this;
        try {
            this.generateProps().then(function () {
                if (self.viewProperties[1].data
                    && (self.viewProperties[1].data.data === undefined || self.viewProperties[1].data.data.length === 0))
                    self.setDataError();
                else
                    self.call("update");
            });
        } catch (e) {
            this.showError(e);
        }
    }

    call(methodName) {
        try {
            this.viewClass[methodName].apply(this.viewClass, this.viewProperties);
        } catch (e) {
            //this.showError(e);
        }
    }

    setDataError() {
        $(this.container).empty();
        $(this.container).append(
            '<div class="h-100 w-100 d-flex align-items-center justify-content-center">' +
            ' <div class="alert alert-warning" role="alert">' +
            '  No data loaded' +
            ' </div>' +
            '</div>');
    }

    /**
     * Removes the component from the React virtual DOM as it has been manually attached, its necessary to unmount
     * options and the own container if its an options view
     */
    unMount() {
        if (this.hasOptions)
            this.options.unMount();
        if (this.isOptionView)
            try {
                this.viewClass.unMount();
            } catch (e) {
                console.log(e);
            }
    }

    getSchema() {
        return workerSupervisor.getSchema(this.cardId);
    }

    getData() {
        return workerSupervisor.getData(this.cardId);
    }

    generateProps() {
        var self = this;

        return workerSupervisor.loadData(this.cardId).then(function () {

            self.viewProperties[0] = self.container[0];
            self.viewProperties[2] = Object.assign({}, workerSupervisor.board.cards[self.cardId]);
            self.viewProperties[3] = workerSupervisor.getHandler(self.cardId);
            self.viewProperties[4] = self.setProperty;

            var numOptionsId = 0;
            var optionsWithId = {};
            self.viewProperties[2].options.forEach(function (option, index) {
                if (option.id) {
                    optionsWithId[option.id] = index;
                    numOptionsId++;
                }
            });

            var parentConnections = workerSupervisor.board.cards[self.cardId].getAllParents();
            var hasDataConnection = parentConnections.filter(function (connection) {
                return connection.type === ConnectionTypes.DATA_CONNECTION;
            }).length > 0;

            var input = {};
            if (hasDataConnection)
                input = {data: {data: self.getData(), schema: self.getSchema()}};

            parentConnections.forEach(function (connection) {
                //TODO: Correctly check uniqueness
                var isUniqueConnection = _.filter(vizParams.cards[workerSupervisor.board.cards[self.cardId].type].inConnections,
                    {type: connection.type})[0].unique;

                if (!isUniqueConnection) {
                    if (input[ConnectionTypes.property[connection.type]] === undefined)
                        input[ConnectionTypes.property[connection.type]] = [];

                    if (connection.type !== ConnectionTypes.DATA_CONNECTION) {
                        input[ConnectionTypes.property[connection.type]].push(
                            workerSupervisor.board.cards[connection.start][ConnectionTypes.property[connection.type]]);
                    }

                    if (connection.type === ConnectionTypes.OPTION_CONNECTION && numOptionsId > 0) {
                        workerSupervisor.board.cards[connection.start][ConnectionTypes.property[connection.type]].forEach(function (option) {
                            if (optionsWithId[option.id] !== undefined) {
                                self.viewProperties[2].options[optionsWithId[option.id]] = option;
                            }
                        });
                    }
                } else {
                    if (connection.type !== ConnectionTypes.DATA_CONNECTION) {
                        input[ConnectionTypes.property[connection.type]] =
                            workerSupervisor.board.cards[connection.start][ConnectionTypes.property[connection.type]];
                    }
                }
            });
            self.viewProperties[1] = input;
        });
    }
}

module.exports = View;