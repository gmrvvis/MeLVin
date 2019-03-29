'use strict';

class Scatterplot {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    var self = this;
    Plotly.purge(container);
    $(container).html("");
    this.setProperty = setProperty;
    var vizOptions = {
      scrollZoom: true,
      showLink: false,
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displaylogo: false,
      displayModeBar: true
    };

    var xAttr = state.options[0].value;
    var yAttr = state.options[1].value;
    var showAttr = state.options[2].value;

    this.xAttr = xAttr;
    this.yAttr = yAttr;

    var attributes = Object.keys(input.data.schema.attributes);

    var incorrectCols = attributes.indexOf(xAttr) === -1 || attributes.indexOf(yAttr) === -1 || attributes.indexOf(showAttr) === -1;

    if (input.data.data.length > 0 && !incorrectCols) {

      this.pointsIds = input.data.data.map(function(data) {
        return data[0];
      });


      var baseTrace = {
        x: [],
        y: [],
        mode: 'markers',
        name: "not selected",
        type: 'scatter',
        ids: [],
        text: [],
        marker: {
          color: "#000000"
        }
      };
      input.groups = input.groups || [];
      input.groups = [].concat.apply([], input.groups);
      input.groups = input.groups.filter(function(group) {
        return group !== undefined;
      });

      var traces = [baseTrace].concat(input.groups.map(function(group) {
        return {
          x: [],
          y: [],
          mode: 'markers',
          name: group.name,
          type: 'scattergl',
          ids: [],
          text: [],
          marker: {
            color: group.color
          }
        };
      }));
      var xIndex = attributes.indexOf(xAttr);
      var yIndex = attributes.indexOf(yAttr);
      var showAttr = attributes.indexOf(showAttr);
      var i = 0;
      input.data.data.forEach(function(data) {
        var traceNum = 0;
        for (i = 0; i < input.groups.length; i++) {
          if (input.groups[i].points && input.groups[i].points[data[0]]) {
            traceNum = i + 1;
          }
        }
        traces[traceNum].x.push(data[xIndex]);
        traces[traceNum].y.push(data[yIndex]);
        traces[traceNum].text.push(data[showAttr]);
        traces[traceNum].ids.push(data[0]);
      });


      var layout = {
        margin: {
          l: 100,
          r: 100,
          b: 100,
          t: 100,
          pad: 5
        },
        autosize: true,
        dragmode: "pan",
        title: state.options[2].selectedValue,
        xaxis: {
          title: xAttr,
        },
        yaxis: {
          title: yAttr,
        }
      };
      this.trace = traces;
      Plotly.react(container, this.trace, layout, vizOptions);
      $(container)[0].on('plotly_selected', self.onSelection(container, input, state, dataHandler, setProperty));
    } else {
      var message = "";
      if (input.data.data.length === 0)
        message = 'No data provieded';
      else
        message = 'Specified column names not found in the provided data';

      $(container).html('<div style="height:100%;display:flex;flex-flow: column;justify-content:center;align-items:center;">' +
        '<div class="alert alert-info" role="alert">' + message +
        '</div>' +
        '</div>');
    }
  }

  update(container, input, state, dataHandler, setProperty) {
    this.init(container, input, state, dataHandler, setProperty);
  }

  onSelection(container, input, state, dataHandler, setProperty) {
    let self = this;
    return function(event) {
      if (event) {
        let range = Object.assign({}, event.range);
        let selections = [{
          type: "range",
          range: range.x,
          name: self.xAttr
        }, {
          type: "range",
          range: range.y,
          name: self.yAttr
        }, {
          type: "points",
          points: {}
        }];

        event.points.forEach(function(point) {
          selections[2].points[point.id] = true;

        });

        let selectedPointsIDs = event.points.map(function(point) {
          return point.id;
        });
        dataHandler.removeChanges();
        self.pointsIds.filter(function(pointID) {
          return selectedPointsIDs.indexOf(pointID) === -1;
        }).forEach(function(pointID) {
          dataHandler.removeRow(pointID, false)
        });


        dataHandler.saveChanges();
        setProperty("selection", selections);
      } else {
        dataHandler.removeChanges();
        setProperty("selection", []);
        dataHandler.saveChanges();
      }
    };
  }
}

window.Scatterplot = Scatterplot;