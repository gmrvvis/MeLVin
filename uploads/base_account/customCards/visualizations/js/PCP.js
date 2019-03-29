'use strict';

class PCP {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    this.options = {
      scrollZoom: true,
      showLink: false,
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displaylogo: false,
      displayModeBar: true
    };

    let self = this;
    Plotly.purge(container);
    $(container).html("");


    let attributes = input.data.schema.attributes;

    let columns = [];
    state.options[0].value.forEach(function(value) {
      columns.push(value)
    });

    let columnsIndex = columns.map(function(columnName) {
      return Object.keys(attributes).indexOf(columnName);
    });

    let incorrectCols = columnsIndex.some(function(value) {
      return value === -1;
    });
    let correctInput = input.data.data.length > 0 && columns.length > 1 && !incorrectCols;
    var coloredData = 0;

    if (correctInput) {
      let finalData = [];
      let colorUnique = [];
      let colorRaw = [];
      let selections = [].concat.apply([], input.selection);

      input.data.data.forEach(function(data) {
        columns.forEach(function(column, i) {
          if (typeof finalData[i] === "undefined") finalData[i] = [];
          finalData[i].push(data[columnsIndex[i]]);
        });

        var traceNum = 0;
        if (input.groups)
          for (var i = 0; i < input.groups.length; i++) {
            if (input.groups[i].points && input.groups[i].points[data[0]]) {
              traceNum = i + 1;
            }
          }
        if (traceNum > 0) coloredData++;
        colorRaw.push(traceNum);
      });

      let selectedPoints = {};
      selections.filter(function(selection) {
        return selection.type === 'points'
      }).forEach(function(selection) {
        Object.assign(selectedPoints, selection.points)
      });

      selectedPoints = Object.keys(selectedPoints);

      let colorMap = ['#000000'].concat((input.groups || []).map(function(group) {
        return group.color
      }));

      if (coloredData === input.data.data.length) colorMap.shift();
      let trace = {};
      if (selectedPoints.length > 1) {

        trace = {
          type: 'parcoords',
          line: {
            color: input.data.data.map(function(item) {
              return selectedPoints.indexOf(item[0]) !== -1 ? 1 : 0;
            }),
            colorscale: [
              [0, 'black'],
              [1, 'red']
            ]
          },
          dimensions: []
        };
      } else if (colorMap.length > 1) {
        let scale = colorMap.map(function(color, i) {
          return [i / (colorMap.length - 1), color];
        });

        trace = {
          type: 'parcoords',
          line: {
            color: colorRaw,
            colorscale: scale
          },
          dimensions: []
        };
      } else {
        trace = {
          type: 'parcoords',
          line: {
            color: colorMap[0]
          },
          dimensions: []
        };
      }

      columns.forEach(function(column, i) {
        if (attributes[column].attribute_type === "QUANTITATIVE") {

          var properties = {
            range: [_.min(finalData[i]), _.max(finalData[i])],
            label: column,
            values: finalData[i]
          };

          if (selections.length > 0) {

            let selectionColumn = selections.map(function(selection) {
              return selection.name;
            }).indexOf(column);

            if (selectionColumn > -1) {
              let range = selections[selectionColumn].range;
              properties["constraintrange"] = [range[0], range[1]];
            }
          }

          trace.dimensions.push(properties);
        } else {
          var unique = finalData[i].filter(function(value, index, self) {
            return self.indexOf(value) === index;
          });
          var mappedData = finalData[i].map(function(data) {
            return unique.indexOf(data);
          });
          trace.dimensions.push({
            tickvals: Array.apply(null, {
              length: unique.length
            }).map(Function.call, Number),
            ticktext: unique,
            label: column,
            values: mappedData
          })
        }
      });

      Plotly.react(container, [trace], {
        margin: {
          l: 50,
          r: 50,
          b: 30,
          t: 70,
          pad: 5
        },
        autosize: true,
        dragmode: "pan"
      }, this.options);
      $(container)[0].on('plotly_restyle', function() {
        self._onSelection(trace, input, setProperty)
      });

    } else {
      var message = "";
      if (input.data.data.length === 0)
        message = 'No data provieded';
      else if (columns.length <= 1)
        message = 'Not enough attributes provided for the visualization';
      else
        message = 'Specified dimensions not found in the provided data';

      $(container).html('<div style="height:100%;display:flex;flex-flow: column;justify-content:center;align-items:center;">' +
        '<div class="alert alert-info" role="alert">' + message +
        '</div>' +
        '</div>');
    }
  }

  update(container, input, state, dataHandler, setProperty) {
    this.init(container, input, state, dataHandler, setProperty);
  }

  _onSelection(trace, input, setProperty) {
    var filter = [];
    console.log("PCP Selection:" + trace);
    trace.dimensions.forEach(function(dimension) {
      if (typeof dimension.constraintrange !== "undefined") {
        if (typeof dimension.range !== "undefined" && (dimension.constraintrange[0] !== dimension.range[0] || dimension.constraintrange[1] !== dimension.range[1]))
          filter.push({
            filterType: "QUANTITATIVE",
            selectedRange: dimension.constraintrange,
            name: dimension.label
          });
        else if (typeof dimension.ticktext !== "undefined") {
          var items = dimension.ticktext.slice(Math.ceil(dimension.constraintrange[0]), Math.floor(dimension.constraintrange[1]) + 1);
          filter.push({
            filterType: "CATEGORICAL",
            selectedItems: items,
            name: dimension.label
          })
        }
      }
    });

    var selectionPoints = {
      type: "points",
      points: {}
    };
    var attrs = Object.keys(input.data.schema.attributes);
    input.data.data.forEach(function(data) {
      var isInGroup = true;
      for (var i = 0; i < filter.length && isInGroup; i++) {
        var selection = filter[i];
        if (selection.filterType === "QUANTITATIVE") {
          isInGroup = selection.selectedRange[0] <= data[attrs.indexOf(selection.name)] &&
            selection.selectedRange[1] >= data[attrs.indexOf(selection.name)];
        } else {
          isInGroup = selection.selectedItems.indexOf(data[attrs.indexOf(selection.name)]) !== -1;
        }
      }

      if (isInGroup) selectionPoints.points[data[0]] = true;
    });

    if (Object.keys(selectionPoints.points).length === input.data.data.length)
      selectionPoints.points = {};
    setProperty("selection", selectionPoints);
  }
}

window.PCP = PCP;