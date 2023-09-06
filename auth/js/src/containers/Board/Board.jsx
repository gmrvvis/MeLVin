'use strict';

var React = require('react');

var connect = require("react-redux").connect;
var ActionTypes = require('../../actions/ActionTypes');
var ConnectionTypes = require('./../../constants/ConnectionTypes');
var Card = require('../../model/Card');
var VisualizationOptions = require('../../constants/VisualizationOptions');
var vizParams = require('../../constants/CardsSchema');

var margin = 0;
var height = 0;
var width = 0;
var offsetX = 0;
var offsetY = 0;
var cardHeight = 0;

var Board = React.createClass({

    getDefaultProps: function () {
        return {
            margin: {top: 20, right: 10, bottom: 20, left: 10},
            cardDim: {height: 160, width: 200, margin: 40}
        };
    },

    componentDidMount: function () {
        var container = this.refs.container;
        this.translate = this.props.ui.translate || [0, 0];
        this.scale = this.props.ui.scale || 1;
        this.boardDataMutable = {};
        this.createBlueprint(container);
        this.updateBoard(container, this.props);
        this.attachListeners(this.svgNode, container, this.realSVG);
        try {
            this._goToHome(true);
        } catch (e) {
        }
    },

    updateBoard: function (container, updatedState) {
        var self = this;

        this.boardPositions = {};
        this.connectionsMutable = [];

        //TODO: fix loaded zoom
        d3.select(container).select("svg g")
            .attr("transform", "translate(" + self.translate + ")scale(" + self.scale + ")");

        updatedState.cards.allIds.forEach(function (id) {
            var card = self.props.cards.byId[id];

            var layers = [];

            Object.keys(self.props.layers.connections).forEach(function (layerKey) {
                if (self.props.layers.connections[layerKey].indexOf(id) !== -1)
                    layers.push(layerKey);
            });

            if (typeof self.boardDataMutable[id] === "undefined")
                self.boardDataMutable[id] = new Card({});

            //Update board data card properties to allow d3 data binding to work
            for (var cardProperty in card) {
                if (card.hasOwnProperty(cardProperty)) {
                    self.boardDataMutable[id][cardProperty] = card[cardProperty];
                }
            }
            self.boardDataMutable[id]._layer = layers;
        });

        self.connectionsMutable = updatedState.connections.allIds.map(function (id) {
            return updatedState.connections.byId[id];
        });

        for (var property in this.boardDataMutable) {
            // if (this.boardDataMutable.hasOwnProperty(property)
            //     && !this.props.cards.byId.hasOwnProperty(property)) {
            //     delete this.boardDataMutable[property];
            // } else {
            var card = this.boardDataMutable[property];

            // if (card.id >= self.props.lastCardID)
            //     self.props.lastCardID = card.id + 1;

            self.boardPositions["" + card.posX + " " + card.posY] = true;
            card.children = [];
            card.parents = [];

            self.connectionsMutable.forEach(function (connection) {
                if (connection.start === card.id)
                    card.children.push(connection);
                if (connection.end === card.id)
                    card.parents.push(connection);
            });
            // }
        }

        this.createCards(container);
        this.createConnections();
    },

    componentWillUnmount: function () {
        this.props.dispatch({type: ActionTypes.TRANSLATE, translate: this.translate});
        this.props.dispatch({type: ActionTypes.SCALE, scale: this.scale});
    },

    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },

    componentDidUpdate: function () {
        var container = this.refs.container;
        this.updateBoard(container, this.props);
    },

    closestGridPos: function (container, event) {
        var containerOffset = $(container).parent().offset();
        var mousePosX = (-this.translate[0] + event.originalEvent.pageX - containerOffset.left) / this.scale;
        var mousePoxY = (-this.translate[1] + event.originalEvent.pageY - containerOffset.top) / this.scale;

        var x = Math.floor(mousePosX / (width + margin)) * (width + margin);
        var y = Math.floor(mousePoxY / (height + margin)) * (height + margin);

        return {x: x, y: y}
    },

    generateLine: function (connection) {

        var startCard = _.find(this.boardDataMutable, function (o) {
            return o.id === connection.start;
        });
        var endCard = _.find(this.boardDataMutable, function (o) {
            return o.id === connection.end;
        });

        var children = this.connectionsMutable.filter(function (conn) {
            return conn.start === connection.start;
        }).map(function (conn) {
            return conn.type + (conn.startIndex || 0);
        }).filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

        var parents = this.connectionsMutable.filter(function (conn) {
            return conn.end === connection.end
        }).map(function (conn) {
            return conn.type + (conn.endIndex || 0);
        }).filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });


        var startConnNum = children.indexOf(connection.type + (connection.startIndex || 0)) + 1;

        var endConnNum = parents.indexOf(connection.type + (connection.endIndex || 0)) + 1;

        var adjacentColumn = startCard.posX + 1 === endCard.posX;
        let sameRow = startCard.posY === endCard.posY;
        var adjacentRight = adjacentColumn && sameRow;
        var startCardBelow = endCard.posY < startCard.posY ||
            (sameRow && startConnNum >= endConnNum && children.length <= parents.length);
        var startCardBefore = endCard.posX > startCard.posX;

        var noCardInBetween = true;
        let noCardInBetweenNextRow = false;

        if (sameRow) {
            var result = _.find(this.boardDataMutable, function (o) {
                return o.posY === startCard.posY
                    && o.posX > Math.min(startCard.posX, endCard.posX)
                    && o.posX < Math.max(startCard.posX, endCard.posX);
            });
            noCardInBetween = typeof result === "undefined";
        }

        if (startCardBefore && !adjacentColumn) {
            let result = _.find(this.boardDataMutable, function (o) {
                return o.posY === endCard.posY
                    && o.posX > Math.min(startCard.posX, endCard.posX)
                    && o.posX < Math.max(startCard.posX, endCard.posX);
            });
            noCardInBetweenNextRow = typeof result === "undefined";
        }


        var startCardY = startCard.posY * (height + margin);

        var marginBetweenConStart = cardHeight / (children.length + 1);
        var marginBetweenConEnd = cardHeight / (parents.length + 1);

        var lineStartPosX = (startCard.posX * (width + margin)) + width;
        var lineEndPosX = (endCard.posX * (width + margin));
        var lineStartPosY = (startCard.posY * (height + margin)) + (marginBetweenConStart * startConnNum);
        var lineEndPosY = (endCard.posY * (height + margin)) + (marginBetweenConEnd * endConnNum);

        if (typeof startCard.x !== "undefined" && typeof startCard.y !== "undefined") {
            lineStartPosX = startCard.x + width;
            lineStartPosY = startCard.y + (marginBetweenConStart * startConnNum);
        }

        if (typeof endCard.x !== "undefined" && typeof endCard.y !== "undefined") {
            lineEndPosX = endCard.x;
            lineEndPosY = endCard.y + (marginBetweenConEnd * endConnNum);
        }

        var linePosY = startCardBelow ? -margin : height;

        var lineStartMargin = (margin * 0.25);
        var lineEndMargin = startCardBefore ? -(margin * 0.75) : -(margin * 0.25);

        var centeredSame = children.length === parents.length && startConnNum === endConnNum;
        var centeredSymmetric = Math.ceil(children.length / 2) === startConnNum && Math.ceil(parents.length / 2) === endConnNum && (parents.length > 2 || children.length > 2)
        var centeredConnection = sameRow && startCard.posX < endCard.posX && (centeredSame || centeredSymmetric);
        var curveRadiusX = startCardBefore ? -10 : 10;
        var curveRadiusY = startCardBelow ? -10 : 10;

        var line = "M " + lineStartPosX + " " + lineStartPosY;

        if (!(noCardInBetween && centeredConnection)) {

            line += "L " + (lineStartPosX + lineStartMargin - Math.abs(curveRadiusX)) + " " + lineStartPosY;
            line += "Q " + (lineStartPosX + lineStartMargin) + " " + lineStartPosY + " " +
                (lineStartPosX + lineStartMargin) + " " + (lineStartPosY +
                    (endCard.posY === startCard.posY && startCardBefore && startConnNum > endConnNum ? -curveRadiusY :
                        curveRadiusY));

            if (noCardInBetween && (sameRow) && startCardBefore) {
                line += "L " + (lineStartPosX + lineStartMargin) + " " + (lineEndPosY +
                    (endCard.posY === startCard.posY && startCardBefore && startConnNum > endConnNum ? curveRadiusY :
                        -curveRadiusY));
                line += "Q " + (lineStartPosX + lineStartMargin) + " " + lineEndPosY + " " +
                    (lineStartPosX + lineStartMargin + Math.abs(curveRadiusX)) + " " + lineEndPosY;
            }

            if (!((noCardInBetweenNextRow && startCardBefore) || adjacentColumn || (noCardInBetween && sameRow && startCardBefore))) {
                line += "L " + (lineStartPosX + lineStartMargin) + " " +
                    (startCardY + linePosY + (startCardBefore ? margin * 0.75 : margin * 0.25) - curveRadiusY);
                line += "Q " + (lineStartPosX + lineStartMargin) + " " +
                    (startCardY + linePosY + (startCardBefore ? margin * 0.75 : margin * 0.25)) + " " +
                    (lineStartPosX + lineStartMargin - curveRadiusX) + " " +
                    (startCardY + linePosY + (startCardBefore ? margin * 0.75 : margin * 0.25));

                line += "L " + (lineEndPosX + lineEndMargin + curveRadiusX) + " " +
                    (startCardY + linePosY + (startCardBefore ? margin * 0.75 : margin * 0.25));
                line += "Q " + (lineEndPosX + lineEndMargin) + " " +
                    (startCardY + linePosY + (startCardBefore ? margin * 0.75 : margin * 0.25)) + " " +
                    (lineEndPosX + lineEndMargin) + " " +
                    (startCardY + linePosY + (startCardBefore ? margin * 0.75 : margin * 0.25)
                        + (endCard.posY === startCard.posY ? -curveRadiusY : curveRadiusY));

            }

            if (!(noCardInBetween && sameRow && startCardBefore)) {
                let startPosX = (noCardInBetweenNextRow && startCardBefore) ? lineStartPosX + lineStartMargin : lineEndPosX + lineEndMargin
                line += "L " + startPosX + " " + (lineEndPosY - (sameRow && !startCardBefore ? -curveRadiusY : sameRow && startCardBefore ? -curveRadiusY : curveRadiusY));
                line += "Q " + startPosX + " " + lineEndPosY + " " + (startPosX + Math.abs(curveRadiusX)) + " " + lineEndPosY;
            }
        }

        line += "L " + lineEndPosX + " " + lineEndPosY;

        return line;
    },

    generateBackground: function (svg, height, width, margin, translate, scale) {
        svg.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    },

    createBlueprint: function (container) {
        var self = this;
        margin = this.props.cardDim.margin;
        height = this.props.cardDim.height;
        width = this.props.cardDim.width;
        cardHeight = this.props.cardDim.height * 0.85;
        var initialX = this.props.translate ? this.props.translate[0] : 0;
        var initialY = this.props.translate ? this.props.translate[1] : 0;
        var scale = this.props.scale ? this.props.scale : 1;

        self.translate = [initialX, initialY];
        self.scale = scale;

        var svg = d3.select(container);


        var back = svg.append("rect")
            .attr("id", "blueprintZoom")
            .attr("width", $(window).width())
            .attr("height", $(window).height())
            .attr("fill-opacity", 0);
        var realSVG = svg;
        svg = svg.append("g");


        svg.attr("transform", "translate(" + self.translate + ")scale(" + self.scale + ")");
        this.svg = svg;

        //TODO: Do not dispatch
        function zoomF() {
            self.translate = d3.event.translate;
            self.scale = d3.event.scale;
            self.generateBackground(svg, height, width, margin, self.translate, self.scale);
        }

        this.zoom = d3.behavior.zoom().translate(self.translate).scale(self.scale).on("zoom", zoomF);
        this.back = back;
        back.call(this.zoom);


        var svgElements = svg.append("g")
            .attr("transform", "translate(" + margin + "," + margin + ")");

        svgElements.append("rect")
            .attr("class", "square_hidden")
            .attr("fill", "gray")
            .attr("opacity", 0.5)
            .attr("width", width)
            .attr("height", height)
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("transform", 'translate(0,0)')
            .style("display", "none");

        var arrowSize = 3;

        svg.append("defs").append("marker")
            .attr("id", "diamond")
            .attr("refX", 0)
            .attr("refY", arrowSize / 2)
            .attr("markerWidth", 36)
            .attr("markerHeight", 36)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 " + arrowSize / 2 + " " + arrowSize / 2 + " " + arrowSize + " " + arrowSize + " " +
                arrowSize / 2 + " " + arrowSize / 2 + " 0 0 " + arrowSize / 2)
            .style("fill", "black")
            .style("fill-opacity", 1);

        svg.append("defs").append("marker")
            .attr("id", "square")
            .attr("refX", 0)
            .attr("refY", arrowSize / 2)
            .attr("markerWidth", 36)
            .attr("markerHeight", 36)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 " + arrowSize + " " + arrowSize + " " + arrowSize + " " + arrowSize + " 0 0 0")
            .style("fill", "black")
            .style("fill-opacity", 1);


        var defsShadow = svg.append("defs")
            .attr("id", "shadowFilter");

        var shadow = defsShadow.append("filter")
            .attr("id", "shadow")
            .attr("height", "130%");

        shadow.append("feOffset")
            .attr("in", "SourceGraphic")
            .attr("dx", 0)
            .attr("dy", 2)
            .attr("result", "offOut");

        shadow.append("feColorMatrix")
            .attr("in", "offOut")
            .attr("type", "matrix")
            .attr("values", "0 0 0 0 0.55 0 0 0 0 0.55 0 0 0 0 0.55 0 0 0 1 0")
            .attr("result", "matrixOut");

        shadow.append("feGaussianBlur")
            .attr("in", "matrixOut")
            .attr("stdDeviation", 2)
            .attr("result", "blurOut");

        shadow.append("feBlend")
            .attr("in", "SourceGraphic")
            .attr("in2", "blurOut")
            .attr("mode", "normal");

        svgElements.append("g")
            .attr("id", "vizPathGroup")
            .attr("pointer-events", "none");

        svgElements.append("g")
            .attr("id", "cardGroup");

        svgElements.append("g")
            .attr("id", "pathGroup")
            .attr("pointer-events", "none");

        svgElements.append("g")
            .attr("id", "rightSideTop");

        this.svgNode = svg.node();
        this.realSVG = realSVG.node();
    },

    //TODO: remove jquery-like listeners, check container dependency
    attachListeners: function (svgNode, container, realSVG) {
        var self = this;
        var svg = d3.select(svgNode);

        $(realSVG).on('dragenter', function (event) {
            event.preventDefault();
        });

        $(realSVG).on("dragover", function (event) {
            //TODO: should not show drop indicator, but access to dataTransfer is not allowed
            event.preventDefault();
            var bckCard = self.closestGridPos(this, event);

            svg.select(".square_hidden")
                .attr("transform", "translate(" + [bckCard.x, bckCard.y] + ")")
                .style("display", "block");


        });


        $(realSVG).on("drop", function (event) {

            var cardData = JSON.parse(event.originalEvent.dataTransfer.getData("text"));
            if (cardData !== "" && cardData.type === "card") {
                event.preventDefault();
                svg.select(".square_hidden").style("display", "none");
                var indicatorPosition = self.closestGridPos(this, event);

                var x = Math.floor(indicatorPosition.x / (width + margin)) * (width + margin);
                var y = Math.floor(indicatorPosition.y / (height + margin)) * (height + margin);

                var posX = x / (width + margin);
                var posY = y / (height + margin);


                if ((!self.boardPositions["" + posX + " " + posY]
                    || typeof self.boardPositions["" + posX + " " + posY] === "undefined")) {
                    //TODO: standardize properties
                    var cardCreationData = {
                        posX: posX,
                        posY: posY,
                        title: cardData.title,
                        type: cardData.id,
                        category: cardData.category,
                        schema: {},
                        filters: [],
                        children: [],
                        parents: []
                    };

                    var options = (vizParams.cards[cardData.id].options || []).map(function (option) {
                        return VisualizationOptions.generateOption(option);
                    });

                    self.props.dispatch({
                        type: ActionTypes.ADD_CARD, id: self.props.lastCardID, cardData: cardCreationData,
                        options: options
                    });

                    self.createCards(svgNode);
                    self.boardPositions["" + posX + " " + posY] = true;
                    svg.selectAll(".paths")
                        .attr("d", function (d) {
                            return self.generateLine(d);
                        })
                        .attr("opacity", function (d) {
                            var startCard = _.find(self.boardDataMutable, function (o) {
                                return o.id === d.start;
                            });


                            var visibileStart = false;
                            if (startCard._layer && startCard._layer.length > 0) {
                                startCard._layer.forEach(function (layerID) {
                                    visibileStart = visibileStart ||
                                        (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                                });
                            } else
                                visibileStart = true;

                            var endCard = _.find(self.boardDataMutable, function (o) {
                                return o.id === d.end;
                            });


                            var visibleEnd = false;
                            if (endCard._layer && endCard._layer.length > 0) {
                                endCard._layer.forEach(function (layerID) {
                                    visibleEnd = visibleEnd ||
                                        (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                                });
                            } else
                                visibleEnd = true;


                            if (visibileStart && visibleEnd)
                                return 0.7;
                            else if (self.props.hiddenConnections.indexOf(d.type) !== -1)
                                return self.props.hiddenAlpha;
                            else
                                return 0;
                        });
                    self.updateIcons(svg);
                }
            }
        });
    },

    updateIcons: function (svg) {

        svg.selectAll(".inConnections").each(function (d) {
            var self = this;

            let types = new Map();
            d.parents.forEach(function (connection) {
                types.set(connection.type + (connection.endIndex || 0), connection.type)
            });
            types = Array.from(types.values());
            var separation = cardHeight / (types.length + 1);

            d3.select(self).selectAll('*').remove();
            types.forEach(function (type, i) {
                var diameter = Math.min(height, width) * 0.06;
                var y = separation * (i + 1);
                var x = width * 0.055;
                var xOut = width * 0.105;
                var xOutOut = width * 0.135;
                var xOutCurve = width * 0.125;
                var yUpper = y - diameter * 0.78;
                var yLower = y + diameter * 0.78;

                d3.select(self).append("circle")
                    .attr("cy", separation * (i + 1))
                    .attr("cx", x)
                    .attr("r", diameter)
                    .attr("fill", ConnectionTypes.colors[type] || "#292c33")
                    .attr("stroke", "#0a0a0e")
                    .attr("stroke-width", 0);


                d3.select(self).append("path")
                    .attr("fill", ConnectionTypes.colors[type] || "#0a0a0e")
                    .attr("stroke", ConnectionTypes.colors[type] || "#0a0a0e")
                    .attr("stroke-width", 1)
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round")
                    .attr("d", "M " + xOut + " " + yUpper + " L " + xOutOut + " " + y + " L " + xOut + " " + yLower +
                        " Q " + xOutCurve + " " + y + " " + xOut + " " + yUpper);


                d3.select(self).append("text")
                    .attr("class", "fa connection-type")
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")
                    .attr("font-size", cardHeight * 0.08)
                    .attr("y", separation * (i + 1))
                    .attr("x", x)
                    .text(ConnectionTypes.icons[type]);
            });
        });

        svg.selectAll(".outConnections").each(function (d) {
            var self = this;
            var types = {};
            d.children.forEach(function (connection) {
                if (types[connection.type + "-" + (connection.startIndex || 0)] === undefined)
                    types[connection.type + "-" + (connection.startIndex || 0)] = {
                        type: connection.type,
                        startIndex: connection.startIndex
                    }
            });

            types = Object.values(types);

            var separation = cardHeight / (types.length + 1);

            d3.select(self).selectAll('*').remove();
            types.forEach(function (connObj, i) {
                var diameter = Math.min(height, width) * 0.06;
                var y = separation * (i + 1);
                var x = width * 0.06;
                var xOut = width * 0.11;
                var xOutOut = width * 0.14;
                var xOutCurve = width * 0.13;
                var yUpper = y - diameter * 0.78;
                var yLower = y + diameter * 0.78;
                d3.select(self).append("circle")
                    .attr("cy", y)
                    .attr("cx", x)
                    .attr("r", diameter)
                    .attr("fill", ConnectionTypes.colors[connObj.type] || "#292c33")
                    .attr("stroke", "#0a0a0e")
                    .attr("stroke-width", 0);

                d3.select(self).append("path")
                    .attr("fill", ConnectionTypes.colors[connObj.type] || "#0a0a0e")
                    .attr("stroke", ConnectionTypes.colors[connObj.type] || "#0a0a0e")
                    .attr("stroke-width", 1)
                    .attr("stroke-linecap", "round")
                    .attr("stroke-linejoin", "round")
                    .attr("d", "M " + xOut + " " + yUpper + " L " + xOutOut + " " + y + " L " + xOut + " " + yLower +
                        " Q " + xOutCurve + " " + y + " " + xOut + " " + yUpper);

                d3.select(self).append("text")
                    .attr("class", "fa connection-type")
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")
                    .attr("font-size", cardHeight * 0.07)
                    .attr("y", y)
                    .attr("x", x)
                    .text(ConnectionTypes.icons[connObj.type]);
            });
        });
    },

    createToolTip: function (container) {

    },

    createConnections: function () {
        var self = this;

        var paths = d3.select("#pathGroup")
            .selectAll(".paths")
            .data(self.connectionsMutable, function (d) {
                return d.start + "-" + d.end + "-" + d.type;
            });

        paths.enter()
            .append("path")
            .attr("class", "paths")
            .attr("stroke", function (d) {
                return ConnectionTypes.colors[d.type] || "black"
            })
            .attr("opacity", function (d) {
                var startCard = _.find(self.boardDataMutable, function (o) {
                    return o.id === d.start;
                });


                var visibileStart = false;
                if (startCard._layer && startCard._layer.length > 0) {
                    startCard._layer.forEach(function (layerID) {
                        visibileStart = visibileStart ||
                            (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                    });
                } else
                    visibileStart = true;

                var endCard = _.find(self.boardDataMutable, function (o) {
                    return o.id === d.end;
                });


                var visibleEnd = false;
                if (endCard._layer && endCard._layer.length > 0) {
                    endCard._layer.forEach(function (layerID) {
                        visibleEnd = visibleEnd ||
                            (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                    });
                } else
                    visibleEnd = true;


                if (visibileStart && visibleEnd)
                    return 0.7;
                else if (self.props.hiddenConnections.indexOf(d.type) !== -1)
                    return self.props.hiddenAlpha;
                else
                    return 0;
            })
            .attr("marker-start", "url(#arrowStart)")
            .attr("marker-end", function (d) {
                if (d.type === ConnectionTypes.DATA_CONNECTION)
                    return "url(#arrowEnd)";
                else if (d.type === ConnectionTypes.COLOR_CONNECTION)
                    return "url(#arrowEnd)";
                else if (d.type === ConnectionTypes.SELECTION_CONNECTION)
                    return "url(#arrowEnd)";
                else
                    return "url(#arrowEnd)";
            })
            .attr("d", function (d) {
                return self.generateLine(d);
            });

        paths.exit()
            .transition("delete_path")
            .duration(150)
            .ease(d3.easeLinear)
            .attr("opacity", 0)
            .remove();

        paths.each(function (d) {
            if (self.props.highlightedConn.indexOf(d.id) !== -1) {
                this.parentElement.appendChild(this);
                d3.select(this)
                    .style("stroke", "#ff2d0f")
                    .style("stroke-dasharray", 0)
                    .attr("opacity", 1)
                    .transition("highlight_path")
                    .duration(150)
                    .ease(d3.easeLinear)
                    .style("stroke-width", 3);
            } else {
                d3.select(this)
                    .style("stroke", null)
                    .style("stroke-dasharray", null)
                    .attr("opacity", function (d) {
                        var startCard = _.find(self.boardDataMutable, function (o) {
                            return o.id === d.start;
                        });


                        var visibileStart = false;
                        if (startCard._layer && startCard._layer.length > 0) {
                            startCard._layer.forEach(function (layerID) {
                                visibileStart = visibileStart ||
                                    (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                            });
                        } else
                            visibileStart = true;

                        var endCard = _.find(self.boardDataMutable, function (o) {
                            return o.id === d.end;
                        });


                        var visibleEnd = false;
                        if (endCard._layer && endCard._layer.length > 0) {
                            endCard._layer.forEach(function (layerID) {
                                visibleEnd = visibleEnd ||
                                    (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                            });
                        } else
                            visibleEnd = true;


                        if (visibileStart && visibleEnd)
                            return 0.7;
                        else if (self.props.hiddenConnections.indexOf(d.type) !== -1)
                            return self.props.hiddenAlpha;
                        else
                            return 0;
                    })
                    .transition("unhighlight_path")
                    .duration(150)
                    .ease(d3.easeLinear)
                    .style("stroke-width", 2);
            }

            d3.select(this).attr("d", function (d) {
                return self.generateLine(d);
            });
        });


    },

    createCards: function (container) {

        var width = (this.props.cardDim.width - 50);
        var widthFull = this.props.cardDim.width;
        var svg = d3.select(container).select("svg g");
        var self = this;

        var drag = d3.behavior.drag()
            .on("dragstart", this._dragStart(container))
            .on("drag", this._drag(container))
            .on("dragend", this._dragEnd(container));

        var squares = d3.select("#cardGroup")
            .selectAll(".card-container")
            .data(d3.values(this.boardDataMutable), function (d) {
                return d.id;
            });


        var newSquare = squares
            .enter()
            .append("g")
            .attr("class", "card-container")
            .attr("opacity", function (d) {
                var visibile = false;
                if (d._layer && d._layer.length > 0) {
                    d._layer.forEach(function (layerID) {
                        visibile =
                            visibile || (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                    });
                } else
                    visibile = true;

                return visibile ? 1 : 0;
            })
            .attr("transform", function (d) {
                return 'translate(' + [d.posX * (self.props.cardDim.width + margin), d.posY * (height + margin)] + ')'
            })
            .on("mouseenter", function (d) {
                d3.select(this).selectAll('.remove-button').attr("opacity", 1);
                d3.select(this).selectAll('.options-button').attr("opacity", 1);
            })
            .on("mouseleave", function (d) {
                d3.select(this).selectAll('.remove-button').attr("opacity", 0);
                d3.select(this).selectAll('.options-button').attr("opacity", 0);

            });

        svg.selectAll('.card-container').attr("opacity", function (d) {
            var visibile = false;
            if (d._layer && d._layer.length > 0) {
                d._layer.forEach(function (layerID) {
                    visibile =
                        visibile || (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                });
            } else
                visibile = true;

            return visibile ? 1 : 0;
        });

        squares
            .exit()
            .transition("delete_card")
            .duration(150)
            .ease(d3.easeLinear)
            .attr("opacity", 0)
            .remove();

        newSquare.append("rect")
            .attr("class", "card-background")
            .attr("filter", "url(#shadow)")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", this.props.cardDim.width)
            .attr("height", height);


        var card = newSquare.append("g").attr("transform", 'translate(' + [25, 0] + ')');
        var cardColors = newSquare.append("g").attr("class", "card-colors")
            .attr("transform", 'translate(' + [0, height * 0.65] + ')');
        var cardFooter = newSquare.append("g").attr("class", "card-footer")
            .attr("transform", 'translate(' + [0, height * 0.65] + ')');
        var cardLeftSide = newSquare.append("g");
        var cardLeftSideTop = newSquare.append("g").attr("class", "conn-in");
        var cardRightSide = newSquare.append("g").attr("transform", 'translate(' + [172, 0] + ')');
        var cardRightSideTop = newSquare.append("g").attr("transform", 'translate(' + [172, 0] + ')')
            .attr("class", "conn-out");
        var cardConnSelect = newSquare.append("g").attr("class", "cardConnSelect");

        newSquare.on("mousedown", function (d) {
            if (self.props.layers.activeBrush) {
                self.props.dispatch({
                    type: ActionTypes.ADD_CARD_TO_ACTIVE_LAYER,
                    id: d.id,
                    layer: self.props.layers.activeLayerId
                });

                var layers = (d._layer || []).concat();
                if (layers.indexOf(self.props.layers.activeLayerId) === -1)
                    layers.push(self.props.layers.activeLayerId);
                else
                    layers = layers.filter(function (id) {
                        return id !== self.props.layers.activeLayerId;
                    });

                self.props.dispatch({
                    type: ActionTypes.SET_CARD_PROP,
                    id: d.id,
                    prop: "_layer",
                    value: layers
                })
            }
        });

        svg.selectAll(".card-background")
            .style("stroke", function (d) {
                if (d.id === self.props.selectedCard
                    && self.props.floatingMenuIndex === 1)
                    return "#2196F3";
                else
                    return null;
            })
            .style("stroke-width", function (d) {
                if (d.id === self.props.selectedCard
                    && self.props.floatingMenuIndex === 1)
                    return 3;
                else
                    return null;
            });

        card.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "white")
            .attr("width", width)
            .attr("height", height * 0.6);

        var buttonWPerc = 0.13;
        var buttonWidth = widthFull * buttonWPerc;
        var buttonCenter = buttonWidth * 0.5;


        var removeButton = card
            .append("g")
            .attr("class", "remove-button button fade-svg-opacity")
            .attr("opacity", 0)
            .attr("transform", "translate(" + [(widthFull - 60) * (1 - buttonWPerc), 0] + ")");

        removeButton
            .append("rect")
            .attr("x", -1)
            .attr("width", buttonWidth + 1)
            .attr("height", buttonWidth + 1)
            .style("fill", "#eee")
            .style("fill-opacity", 1);

        removeButton
            .append("rect")
            .attr("width", buttonWidth)
            .attr("height", buttonWidth)
            .style("fill", "#fff")
            .style("fill-opacity", 1);

        removeButton
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("class", "fa")
            .attr("font-size", height * 0.1)
            .attr("x", buttonCenter)
            .attr("y", buttonCenter)
            .attr("fill", '#484848')
            .text('\uf00d');

        removeButton
            .append("rect")
            .attr("width", buttonWidth)
            .attr("height", buttonWidth)
            .on("click", this._handleRemoveCard());


        var opetionButton = card
            .append("g")
            .attr("class", "options-button button fade-svg-opacity")
            .attr("opacity", 0)
            .attr("transform", "translate(" + [3, 0] + ")");

        opetionButton
            .append("rect")
            .attr("x", 0)
            .attr("width", buttonWidth + 1)
            .attr("height", buttonWidth + 1)
            .style("fill", "#eee")
            .style("fill-opacity", 1);

        opetionButton
            .append("rect")
            .attr("width", buttonWidth)
            .attr("height", buttonWidth)
            .style("fill", "#fff")
            .style("fill-opacity", 1);

        opetionButton
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("class", "fa")
            .attr("font-size", height * 0.1)
            .attr("x", buttonCenter)
            .attr("y", buttonCenter)
            .attr("fill", '#484848')
            .text('\uf013');

        opetionButton
            .append("rect")
            .attr("width", buttonWidth)
            .attr("height", buttonWidth)
            .on("click", this._handleSelectCard());

        var cardContent = card
            .append("g")
            .attr("transform", "translate(" + [0, 26] + ")")
            .attr("cursor", "move")
            .attr("class", "previewContainer")
            .call(drag);


        d3.selectAll(".previewContainer").each(function (d) {
            if (d.processing) {
                d3.select(this).selectAll('*').remove();
                d3.select(this)
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", height * 0.25)
                    .attr("x", width * 0.5)
                    .attr("y", height * 0.2)
                    .attr("fill", "black")
                    .text((d.progress.progress + "").split('.')[0] + "%");

                d3.select(this)
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", height * 0.1)
                    .attr("x", width * 0.5)
                    .attr("y", height * 0.38)
                    .attr("fill", "black")
                    .text(d.progress.info);
                d3.select(this)
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", height * 0.45)
                    .attr("rx", 5)
                    .attr("rx", 5)
                    .attr("width", width)
                    .attr("height", height * 0.1)
                    .attr("fill", "#b5b5b5");

                d3.select(this)
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", height * 0.45)
                    .attr("rx", 5)
                    .attr("rx", 5)
                    .attr("width", d.progress.progress * width * 0.01)
                    .attr("height", height * 0.1)
                    .attr("fill", "#246cb7");

                d.afterProcessing = true;

            } else if (d.afterProcessing) {
                var elem = this;

                d3.select(this).selectAll('*').remove();
                d3.select(this)
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", height * 0.15)
                    .attr("x", width * 0.5)
                    .attr("y", height * 0.2)
                    .attr("fill", "black")
                    .attr("font-weight", "bold")
                    .text("Work");

                d3.select(this)
                    .append("text")
                    .attr("text-anchor", "middle")
                    .attr("alignment-baseline", "middle")
                    .attr("font-size", height * 0.15)
                    .attr("x", width * 0.5)
                    .attr("y", height * 0.36)
                    .attr("fill", "black")
                    .attr("font-weight", "bold")
                    .text("finished");

                setTimeout(
                    function () {
                        d3.select(elem).selectAll('*').remove();
                        d3.select(elem)
                            .append("image")
                            .attr("x", 8)
                            .attr("y", 0)
                            .attr("class", "previewImage")
                            .attr("width", widthFull - 65)
                            .attr("height", cardHeight * 0.5)
                            .attr("xlink:href", function (d) {
                                if (vizParams.cards[d.type] !== undefined)
                                    return "./" + vizParams.cards[d.type].thumbnail;
                                else return './auth/assets/images/notLoaded.svg'
                            });
                        d.afterProcessing = false;
                    }, 1000);
            } else {
                d3.select(this).selectAll('*').remove();
                d3.select(this)
                    .append("image")
                    .attr("x", 8)
                    .attr("y", 0)
                    .attr("class", "previewImage")
                    .attr("width", widthFull - 65)
                    .attr("height", cardHeight * 0.5)
                    .attr("xlink:href", function (d) {
                        if (vizParams.cards[d.type] !== undefined)
                            return "./" + vizParams.cards[d.type].thumbnail;
                        else return './auth/assets/images/notLoaded.svg'
                    });
            }
        });


        cardFooter
            .append("rect")
            .attr("class", "card-footer")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("y", -1)
            .attr("width", widthFull)
            .attr("height", height * 0.20 + 1)
            .attr("cursor", "pointer")
            .on("mousedown", function (d) {
                self._handleSelectCard()(d)
            });


        var titleElements = cardFooter
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", Math.min(width, height) * 0.09)
            .attr("x", widthFull * 0.5)
            .attr("y", height * 0.04);

        titleElements
            .append("tspan")
            .attr("class", "cardTitle")
            .text(function (d) {
                // if (d.finishedWork || d.category === 'viz') {
                //     if (d.title.length > 15)
                //         return d.title.substring(0, 15) + "...";
                //     else
                //         return d.title;
                // } else {
                //     if (d.title.length > 14)
                //         return " " + d.title.substring(0, 14) + "...";
                //     else
                //         return " " + d.title;
                // }
                return d.title;
            });


        var subTitleElements = cardFooter
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", Math.min(width, height) * 0.09)
            .attr("x", widthFull * 0.5)
            .attr("y", height * 0.14);

        subTitleElements
            .append("tspan")
            .text(function (d) {
                // if (d.finishedWork || d.category === 'viz') {
                //     if (d.title.length > 15)
                //         return d.title.substring(0, 15) + "...";
                //     else
                //         return d.title;
                // } else {
                //     if (d.title.length > 14)
                //         return " " + d.title.substring(0, 14) + "...";
                //     else
                //         return " " + d.title;
                // }
                return vizParams.cards[d.type].title;
            });


        // titleElements
        //     .append("tspan")
        //     .text(function (d) {
        //         return " " + d.id;
        //     });


        // cardFooter
        //     .append("rect")
        //     .attr("x", 0)
        //     .attr("width", widthFull)
        //     .attr("y", 0)
        //     .attr("height", 3);


        cardColors
            .append("rect")
            .attr("class", "card-colors")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", widthFull)
            .attr("height", height * 0.35);

        cardColors.each(function (d) {
            if (d._layer && d._layer.length > 0) {
                var cardColor = d3.select(this);
                cardColor.selectAll('.colorCircle').remove();
                var colorLength = d._layer.length; //TODO: check if all layerOptions still exist
                var initialX = (widthFull -
                        (((buttonWidth / 4) * colorLength) + ((widthFull * 0.1 - buttonWidth / 4) * (colorLength - 1)))) /
                    2;
                d._layer.forEach(function (layerID, i) {
                    if (self.props.layers.byId[layerID]) {
                        cardColor.append("circle")
                            .attr("class", "colorCircle")
                            .attr("r", buttonWidth / 4)
                            .attr("cy", height * 0.275)
                            .attr("cx", initialX + (widthFull * 0.1 * i))
                            .attr("stroke", "#000")
                            .attr("stroke-width", 1)
                            .style("fill", self.props.layers.byId[layerID].color)
                            .style("fill-opacity", 1);
                    }
                })

            }
        });

        svg.selectAll(".card-colors").each(function (d) {
            if (d._layer && d._layer.length > 0) {
                var cardColor = d3.select(this);
                cardColor.selectAll('.colorCircle').remove();
                var colorLength = d._layer.length; //TODO: check if all layerOptions still exist
                var initialX = (widthFull -
                        (((buttonWidth / 4) * colorLength) + ((widthFull * 0.1 - buttonWidth / 4) * (colorLength - 1)))) /
                    2;
                d._layer.forEach(function (layerID, i) {
                    if (self.props.layers.byId[layerID]) {
                        cardColor.append("circle")
                            .attr("class", "colorCircle")
                            .attr("r", buttonWidth / 4)
                            .attr("cy", height * 0.275)
                            .attr("cx", initialX + (widthFull * 0.1 * i))
                            .attr("stroke", "#000")
                            .attr("stroke-width", 1)
                            .style("fill", self.props.layers.byId[layerID].color)
                            .style("fill-opacity", 1);
                    }
                })

            }
        });

        cardLeftSide
            .append("rect")
            .attr("x", 25)
            .attr("y", 0)
            .attr("height", cardHeight)
            .attr("width", 3)
            .attr("class", "card-side-fill");

        cardLeftSide
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("height", cardHeight)
            .attr("width", 28)
            .attr("class", "card-side");

        cardLeftSide
            .append("rect")
            .attr("x", 27)
            .attr("y", 0)
            .attr("height", cardHeight)
            .attr("width", 1)
            .attr("class", "card-side-border");


        var connectionTypesIn = cardLeftSide
            .append("g").attr("class", "inConnections");

        connectionTypesIn.each(function (d) {
            var self = this;
            var separation = cardHeight / (d.parents.length + 1);
            d3.select(self).selectAll('*').remove();
            d.parents.forEach(function (connection, i) {
                var diameter = Math.min(height, width) * 0.06;
                d3.select(self).append("rect")
                    .attr("y", separation * (i + 1) - diameter * 0.5)
                    .attr("x", width * 0.04)
                    .attr("width", diameter)
                    .attr("height", diameter)
                    .attr("fill", "#ff0000");

                d3.select(self).append("text")
                    .attr("class", "fa connection-type")
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")
                    .attr("font-size", Math.min(height, width) * 0.06)
                    .attr("y", separation * (i + 1))
                    .attr("x", width * 0.04)
                    .text(ConnectionTypes.icons[connection.type]);
            });
        });

        var arrowSize = 10;
        var marginArrow = 15;
        var widthArrow = 15;

        cardRightSide
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", cardHeight)
            .attr("width", 3)
            .attr("class", "card-side-fill");

        cardRightSide
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("height", cardHeight)
            .attr("width", 28)
            .attr("class", "card-side");

        cardRightSide
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", cardHeight)
            .attr("width", 1)
            .attr("class", "card-side-border");


        var connectionTypesOut = cardRightSide
            .append("g").attr('class', 'outConnections');

        connectionTypesOut.each(function (d) {
            var self = this;

            var types = {};
            d.children.forEach(function (connection) {
                if (types[connection.type + "-" + (connection.startIndex || 0)] === undefined)
                    types[connection.type + "-" + (connection.startIndex || 0)] = {
                        type: connection.type,
                        startIndex: connection.startIndex
                    }
            });

            types = Object.values(types);

            var separation = cardHeight / (types.length + 1);

            d3.select(self).selectAll('*').remove();
            types.forEach(function (connObj, i) {
                d3.select(self).append("rect")
                    .attr("y", separation * (i + 1))
                    .attr("x", width * 0.04)
                    .attr("width", cardHeight * 0.06)
                    .attr("height", cardHeight * 0.06)
                    .attr("fill", "#ff0000");

                d3.select(self).append("text")
                    .attr("class", "fa connection-type")
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")
                    .attr("font-size", cardHeight * 0.08)
                    .attr("y", separation * (i + 1))
                    .attr("x", width * 0.6)
                    .text(ConnectionTypes.icons[connObj.type]);
            });
        });


        cardLeftSideTop.append("rect")
            .attr("fill", "#F8F8F8")
            .attr("x", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("height", cardHeight)
            .attr("width", 28)
            .on("mouseup", function (d) {
                self.showingConnOut.end = d.id;
                self.showConnOut(container);
                d3.select(container).selectAll('.conn-in').style('opacity', null);
                //d3.select(this.parentNode.parentNode).select('.conn-in').style('opacity', 1);
            });

        cardLeftSideTop.append("rect")
            .attr("fill", "#dedede")
            .attr("x", 27)
            .attr("height", cardHeight)
            .attr("width", 1);

        cardLeftSideTop.append("text")
            .attr("class", "fa")
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle")
            .attr("pointer-events", "none")
            .attr("font-size", height * 0.1)
            .attr("fill", "black")
            .attr("y", cardHeight * 0.5)
            .attr("x", 14)
            .text('\uf067');


        cardRightSideTop.append("rect")
            .attr("fill", "#F8F8F8")
            .attr("x", 0)
            .attr("height", cardHeight)
            .attr("width", 25);


        cardRightSideTop.append("rect")
            .attr("fill", "#F8F8F8")
            .attr("x", 0)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("height", cardHeight)
            .attr("width", 28)
            .on("mouseup", function (d) {
                self.showingConnOut = {start: d.id, end: -1};
                self.showConnOut(container);
                d3.select(container).selectAll('.conn-out').style('opacity', null);
                d3.select(this.parentNode.parentNode).select('.conn-out').style('opacity', 1);
            });

        cardRightSideTop.append("rect")
            .attr("fill", "#dedede")
            .attr("x", 0)
            .attr("height", cardHeight)
            .attr("width", 1);

        cardRightSideTop.append("text")
            .attr("class", "fa")
            .style("dominant-baseline", "central")
            .style("text-anchor", "middle")
            .attr("pointer-events", "none")
            .attr("font-size", height * 0.1)
            .attr("fill", "black")
            .attr("y", cardHeight * 0.5)
            .attr("x", 14)
            .text('\uf067');

        d3.selectAll(".cardTitle")
            .text(function (d) {
                return d.title;
            });

        d3.selectAll(".connectionsIn")
            .text(function (d) {
                return d.parents.length;
            });


        this.updateIcons(svg);
    },

    showConnOut: function (conatiner) {
        var self = this;
        d3.select(conatiner).selectAll(".cardConnSelect").each(function (d) {
            d3.select(this).html("");
            if (d.id === self.showingConnOut.start) {
                var length = vizParams.cards[d.type].outConnections.length;
                var containerHeight = self.props.cardDim.height * 0.65;
                var containerWidth = self.props.cardDim.width;
                var buttonHeight = 40;
                var buttonWidth = 40;
                var margin = 10;
                var hMarginBetween = (containerWidth - (margin * ((length % 4) - 1)) - (buttonWidth * length)) * 0.5;
                var vMarginBetween = (containerHeight - (margin * (Math.floor(length / 4))) -
                    (buttonHeight * (Math.floor(length / 4) + 1))) * 0.5;
                var maxButtonRows = Math.floor(containerHeight / buttonHeight);
                var maxButtonsCols = Math.floor(containerWidth / buttonWidth);
                var fontSize = Math.min(containerHeight, containerWidth) * 0.15;

                d3.select(this).append('rect')
                    .attr('width', containerWidth)
                    .attr('height', containerHeight)
                    .attr('fill', "#3A3A3A")
                    .attr('rx', 3)
                    .attr('ry', 3);

                var close = d3.select(this).append("g")
                    .attr("transform", "translate(" + [containerWidth - fontSize * 0.75, fontSize * 0.75] +
                        ")");

                close
                    .append("text")
                    .attr("class", "fa fa-fw")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .attr("font-size", fontSize)
                    .text('\uf00d');

                close
                    .append("rect")
                    .attr("width", fontSize * 2)
                    .attr("height", fontSize * 2)
                    .attr("x", -fontSize * 0.5)
                    .attr("y", -fontSize * 0.5)
                    .attr("fill-opacity", 0)
                    .on("mouseup", function (d) {
                        self.showingConnOut = {start: -1};
                        self.showConnOut(conatiner);
                        d3.select(conatiner).selectAll('.conn-out').style('opacity', null);
                        d3.select(conatiner).selectAll('.conn-in').style('opacity', null);
                    });


                var groups = d3.select(this).selectAll(".buttonGroups")
                    .data(vizParams.cards[d.type].outConnections)
                    .enter()
                    .append("g")
                    .attr("class", "buttonGroups")
                    .attr("transform", function (d, i) {
                        return "translate(" +
                            [hMarginBetween + (margin * i) + (buttonWidth * i) + buttonWidth * 0.5,
                                vMarginBetween + (margin * Math.floor(i / 4)) +
                                (buttonWidth * Math.floor(i / 4)) + buttonHeight * 0.5] + ")"
                    });


                groups.append("rect")
                    .attr("class", "button-background")
                    .attr("width", buttonWidth)
                    .attr("height", buttonHeight)
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("x", -buttonWidth * 0.5)
                    .attr("y", -buttonHeight * 0.5)
                    .attr("fill", function (d) {
                        if (d.type === self.showingConnOut.type) return "#2a6fff";
                        else return "#3A3A3A";
                    });

                groups.append("text")
                    .attr("class", "fa fa-fw")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .attr("font-size", Math.min(containerHeight, containerWidth) * 0.15)
                    .text(function (d) {
                        return ConnectionTypes.icons[d.type];
                    });

                groups.append("rect")
                    .attr("width", buttonWidth)
                    .attr("height", buttonHeight)
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("x", -buttonWidth * 0.5)
                    .attr("y", -buttonHeight * 0.5)
                    .attr("fill-opacity", 0)
                    .on("mouseover", function (d) {
                        var tooltip = $('#tooltip-render');
                        tooltip.find('span').text(d.name || ConnectionTypes.labels[d.type]);
                        var clientRect = this.getBoundingClientRect();
                        tooltip.css('display', 'block').css('top', clientRect.top - clientRect.height - 10)
                            .css('left', clientRect.left + clientRect.width * 0.5 - tooltip.outerWidth() * 0.5);

                    })
                    .on("mouseout", function (d) {
                        $('#tooltip-render').css('display', 'none');
                    })
                    .on("mouseup", function (d) {
                        self.showingConnOut.type = d.type;
                        self.showingConnOut.startIndex = d.index;
                        groups.selectAll(".button-background")
                            .attr("fill", function (d) {
                                if (d.type === self.showingConnOut.type) return "#2a6fff";
                                else return "#3A3A3A";
                            });
                    });


            } else if (d.id === self.showingConnOut.end && self.showingConnOut.type) {


                var length = vizParams.cards[d.type].inConnections.filter(function (conn) {
                    return conn.type === self.showingConnOut.type;
                }).length;
                var containerHeight = self.props.cardDim.height * 0.65;
                var containerWidth = self.props.cardDim.width;
                var buttonHeight = 40;
                var buttonWidth = 40;
                var margin = 10;
                var hMarginBetween = (containerWidth - (margin * ((length % 4) - 1)) - (buttonWidth * length)) * 0.5;
                var vMarginBetween = (containerHeight - (margin * (Math.floor(length / 4))) -
                    (buttonHeight * (Math.floor(length / 4) + 1))) * 0.5;
                var maxButtonRows = Math.floor(containerHeight / buttonHeight);
                var maxButtonsCols = Math.floor(containerWidth / buttonWidth);
                var fontSize = Math.min(containerHeight, containerWidth) * 0.15;

                d3.select(this).append('rect')
                    .attr('width', containerWidth)
                    .attr('height', containerHeight)
                    .attr('fill', "#3A3A3A")
                    .attr('rx', 3)
                    .attr('ry', 3);

                var close = d3.select(this).append("g")
                    .attr("transform", "translate(" + [containerWidth - fontSize * 0.75, fontSize * 0.75] +
                        ")");

                close
                    .append("text")
                    .attr("class", "fa fa-fw")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .attr("font-size", fontSize)
                    .text('\uf00d');

                close
                    .append("rect")
                    .attr("width", fontSize * 2)
                    .attr("height", fontSize * 2)
                    .attr("x", -fontSize * 0.5)
                    .attr("y", -fontSize * 0.5)
                    .attr("fill-opacity", 0)
                    .on("mouseup", function (d) {
                        self.showingConnOut = {start: -1};
                        self.showConnOut(conatiner);
                        d3.select(conatiner).selectAll('.conn-out').style('opacity', null);
                        d3.select(conatiner).selectAll('.conn-in').style('opacity', null);
                    });


                var groups = d3.select(this).selectAll(".buttonGroups")
                    .data(vizParams.cards[d.type].inConnections.filter(function (conn) {
                        return conn.type === self.showingConnOut.type;
                    }))
                    .enter()
                    .append("g")
                    .attr("class", "buttonGroups")
                    .attr("transform", function (d, i) {
                        return "translate(" +
                            [hMarginBetween + (margin * i) + (buttonWidth * i) + buttonWidth * 0.5,
                                vMarginBetween + (margin * Math.floor(i / 4)) +
                                (buttonWidth * Math.floor(i / 4)) + buttonHeight * 0.5] + ")"
                    });


                groups.append("rect")
                    .attr("class", "button-background")
                    .attr("width", buttonWidth)
                    .attr("height", buttonHeight)
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("x", -buttonWidth * 0.5)
                    .attr("y", -buttonHeight * 0.5)
                    .attr("fill", "#3A3A3A");

                groups.append("text")
                    .attr("class", "fa fa-fw")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "central")
                    .attr("font-size", Math.min(containerHeight, containerWidth) * 0.15)
                    .text(function (d) {
                        return ConnectionTypes.icons[d.type];
                    });

                groups.append("rect")
                    .attr("width", buttonWidth)
                    .attr("height", buttonHeight)
                    .attr("rx", 3)
                    .attr("ry", 3)
                    .attr("x", -buttonWidth * 0.5)
                    .attr("y", -buttonHeight * 0.5)
                    .attr("fill-opacity", 0)
                    .on("mouseup", function (d) {
                        self.props.dispatch({
                            type: ActionTypes.ADD_CONNECTION, start: self.showingConnOut.start,
                            end: self.showingConnOut.end,
                            connType: self.showingConnOut.type,
                            startIndex: (self.showingConnOut.startIndex || 0),
                            endIndex: (d.index || 0)
                        });
                        self.showingConnOut = {start: -1};
                        self.showConnOut(conatiner);
                        d3.select(conatiner).selectAll('.conn-out').style('opacity', null);
                        d3.select(conatiner).selectAll('.conn-in').style('opacity', null);
                    });
            }
        })
    },

    _handleRemoveCard: function () {
        var self = this;
        return function (d) {
            delete self.boardDataMutable[d.id];
            self.props.dispatch({type: ActionTypes.REMOVE_CARD, id: d.id});
        }
    },

    _handleSelectCard: function () {
        var self = this;
        return function (d) {
            self.props.dispatch({type: ActionTypes.SELECT_CARD, id: d.id});
            self.props.dispatch({type: ActionTypes.SHOW_FLOATING_MENU, index: 1})
        }
    },

    _dragStart: function (container) {
        var self = this;
        return function (d) {
            if (!self.props.layers.activeBrush) {
                self.boardPositions["" + d.posX + " " + d.posY] = false;
                offsetX = d3.mouse(this.parentNode.parentNode)[0];
                offsetY = d3.mouse(this.parentNode.parentNode)[1];
                this.parentElement.parentElement.parentElement.appendChild(this.parentElement.parentElement);
            }
        }
    },

    _drag: function (container) {
        var self = this;
        var svg = d3.select(container).select("svg g");
        return function (d) {
            if (!self.props.layers.activeBrush) {
                d3.select(this.parentElement.parentElement).attr("opacity", 0.7);
                var mousePosX = d3.mouse(svg.node())[0];
                var mousePosY = d3.mouse(svg.node())[1];

                d.x = mousePosX - offsetX - margin;
                d.y = mousePosY - offsetY - margin;

                d3.select(this.parentNode.parentNode).attr("transform", "translate(" + [d.x, d.y] + ")");
                d3.select(self.rightSideCard).attr("transform", "translate(" + [d.x, d.y] + ")");

                var x = Math.floor(mousePosX / (width + margin)) * (width + margin);
                var y = Math.floor(mousePosY / (height + margin)) * (height + margin);


                svg.select(".square_hidden")
                    .attr("transform", "translate(" + [x, y] + ")")
                    .style("display", "block");

                svg.selectAll(".paths").attr("d", function (d) {
                    return self.generateLine(d);
                }).attr("opacity", function (d) {
                    var startCard = _.find(self.boardDataMutable, function (o) {
                        return o.id === d.start;
                    });


                    var visibileStart = false;
                    if (startCard._layer && startCard._layer.length > 0) {
                        startCard._layer.forEach(function (layerID) {
                            visibileStart = visibileStart ||
                                (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                        });
                    } else
                        visibileStart = true;

                    var endCard = _.find(self.boardDataMutable, function (o) {
                        return o.id === d.end;
                    });


                    var visibleEnd = false;
                    if (endCard._layer && endCard._layer.length > 0) {
                        endCard._layer.forEach(function (layerID) {
                            visibleEnd = visibleEnd ||
                                (self.props.layers.byId[layerID] && self.props.layers.byId[layerID].visibility);
                        });
                    } else
                        visibleEnd = true;


                    if (visibileStart && visibleEnd)
                        return 0.7;
                    else if (self.props.hiddenConnections.indexOf(d.type) !== -1)
                        return self.props.hiddenAlpha;
                    else
                        return 0;
                });

                delete d.x;
                delete d.y;
            }
        }
    },

    _dragEnd: function (container) {
        var self = this;
        var svg = d3.select(container).select("svg g");


        return function (d) {
            if (!self.props.layers.activeBrush) {
                d3.select(this.parentElement.parentElement).attr("opacity", 1);
                var mousePosX = d3.mouse(svg.node())[0];
                var mousePosY = d3.mouse(svg.node())[1];
                var x = Math.floor(mousePosX / (width + margin)) * (width + margin);
                var y = Math.floor(mousePosY / (height + margin)) * (height + margin);
                var posX = x / (width + margin);
                var posY = y / (height + margin);


                if ((!self.boardPositions["" + posX + " " + posY]
                    || typeof self.boardPositions["" + posX + " " + posY] === "undefined")) {
                    d.x = x;
                    d.y = y;
                    d.posX = posX;
                    d.posY = posY;
                    self.props.dispatch({type: ActionTypes.MOVE_CARD, posX: posX, posY: posY, id: d.id});
                } else {
                    d.x = d.posX * (width + margin);
                    d.y = d.posY * (height + margin);
                }

                d3.select(this.parentNode.parentNode)
                    .attr("transform", "translate(" + [d.posX * (width + margin), d.posY * (height + margin)] + ")");
                d3.select(self.rightSideCard)
                    .attr("transform", "translate(" + [d.posX * (width + margin), d.posY * (height + margin)] + ")")
                    .attr("opacity", 1);


                svg.select(".square_hidden")
                    .style("display", "none");


                //TODO: animation
                svg.selectAll(".paths")
                    .attr("d", function (d) {
                        return self.generateLine(d);
                    });


                self.boardPositions["" + d.posX + " " + d.posY] = true;
            }
        }
    },

    _goToHome: function (disableAnimation) {
        var bbox = $('svg g')[0].getBBox();

        this.translate = [document.body.clientWidth / 2 - bbox.x - bbox.width / 2,
            (document.body.clientHeight / 2 - 85) - bbox.y - bbox.height / 2];
        this.scale = 1;
        this.zoom.translate(this.translate).scale(this.scale);
        if (disableAnimation === true)
            this.svg.attr("transform", "translate(" + this.translate + ")scale(" + this.scale + ")");
        else
            this.svg.transition()
                .duration(750)
                .attr("transform", "translate(" + this.translate + ")scale(" + this.scale + ")");

    },

    _defaultScale: function () {
        this.translate[0] /= this.scale;
        this.translate[1] /= this.scale;
        this.scale = 1;
        this.zoom.translate(this.translate).scale(this.scale);
        this.svg
            .transition()
            .duration(150)
            .attr("transform", "translate(" + this.translate + ")scale(" + this.scale + ")");
    },

    _zoomIn: function () {
        this.scale += 0.1;
        this.zoom.scale(this.scale);
        this.svg
            .transition()
            .duration(150)
            .attr("transform", "translate(" + this.translate + ")scale(" + (this.scale) + ")");
    },

    _zoomOut: function () {
        this.scale -= 0.1;
        this.zoom.scale(this.scale);
        this.svg
            .transition()
            .duration(150)
            .attr("transform", "translate(" + this.translate + ")scale(" + (this.scale) + ")");
    },

    _centerOnCard: function () {
        if (this.props.selectedCard !== -1) {
            this.scale = 1;
            this.translate[0] = 0 - this.boardDataMutable[this.props.selectedCard].posX * (width + margin) +
                $(this.svg.node()).parent().width() * 0.5 - width * 0.5 - 40;
            this.translate[1] = 0 - this.boardDataMutable[this.props.selectedCard].posY * (height + margin) +
                $(this.svg.node()).parent().height() * 0.5 - 80 - height * 0.5 - 40;
            if (isNaN(this.translate[0])) this.translate[0] = 0;
            if (isNaN(this.translate[1])) this.translate[1] = 0;
            this.zoom.translate(this.translate).scale(this.scale);
            this.svg
                .transition()
                .duration(350)
                .attr("transform", "translate(" + this.translate + ")scale(" + (this.scale) + ")");
        }
    },

    _saveSession: function () {
        this.props.dispatch({type: ActionTypes.SAVE_SESSION});
    },

    render: function () {
        return (

            <div id="render" className="col h-100">
                <div id="tooltip-render" style={{display: "none"}}><span></span></div>
                <svg height="100%" width="100%" ref="container"/>
                <div className="toolbar">
                    <div className="mr-3">
                        <div className="toolbar-header">
                            <span>Position</span>
                        </div>
                        <ul>
                            <li className="toolbar-item" onClick={this._goToHome}>
                                <i className="fa fa-home"/>
                                <span>Initial</span>
                            </li>
                            <li className="toolbar-item" onClick={this._centerOnCard}>
                                <i className="fa fa-square"/>
                                <span>Card</span>
                            </li>
                        </ul>
                    </div>
                    <div className="mr-3">
                        <div className="toolbar-header">
                            <span>Scale</span>
                        </div>
                        <ul>
                            <li className="toolbar-item" onClick={this._defaultScale}>
                                <i className="fa fa-search"/>
                                <span>Reset</span>
                            </li>
                            <li className="toolbar-item" onClick={this._zoomIn}>
                                <i className="fa fa-search-plus"/>
                                <span>Zoom in</span>
                            </li>
                            <li className="toolbar-item" onClick={this._zoomOut}>
                                <i className="fa fa-search-minus"/>
                                <span>Zoom out</span>
                            </li>
                        </ul>
                    </div>
                    <ul style={{borderTopLeftRadius: "3px", borderTopRightRadius: "3px"}}>
                        <li className="toolbar-item" onClick={this._saveSession}>
                            <i className="fa fa-cloud-upload-alt"/>
                            <span>Save app</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
});

function mapStateToProps(state) {
    return {
        lastCardID: state.cards.lastId,
        selectedCard: state.ui.selectedCard,
        highlightedConn: state.connections.highlighted,
        floatingMenuIndex: state.ui.floatingMenuIndex,
        scale: state.ui.scale,
        translate: state.ui.translate,
        cards: state.cards,
        hiddenConnections: state.ui.hiddenConnections,
        hiddenAlpha: state.ui.hiddenAlpha,
        layers: state.layers,
        ui: state.ui,
        connections: state.connections
    };
}

Board.contextTypes = {
    store: React.PropTypes.object.isRequired
};

module.exports = connect(mapStateToProps)(Board);