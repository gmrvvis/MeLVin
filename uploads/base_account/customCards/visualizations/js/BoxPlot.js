'use strict';

class BoxPlot {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    Plotly.purge(container);
    $(container).html("");
    var options = {
      scrollZoom: true,
      showLink: false,
      modeBarButtonsToRemove: ['sendDataToCloud'],
      displaylogo: false,
      displayModeBar: true
    };

    var valueAttr = Object.keys(input.data.schema.attributes).indexOf(state.options[0].value);


    var incorrectCols = valueAttr === -1;

    if (input.data.data.length > 0 && !incorrectCols) {
      var baseTrace = {
        y: [],
        type: 'box',
        name: "ungrouped",
        marker: {
          color: "#000000"
        }
      };
      input.groups = input.groups || [];
      var traces = [baseTrace].concat(input.groups.map(function(group) {
        return {
          y: [],
          type: 'box',
          name: group.name,
          marker: {
            color: group.color
          }
        };
      }));


      var i = 0;
      input.data.data.forEach(function(data) {
        var traceNum = 0;
        for (i = 0; i < input.groups.length; i++) {
          if (input.groups[i].points && input.groups[i].points[data[0]]) {
            traceNum = i + 1;
          }
        }
        traces[traceNum].y.push(data[valueAttr]);
      });


      var layout = {
        autosize: true,
        dragmode: "pan",
        yaxis: {
          title: Object.keys(input.data.schema.attributes)[valueAttr],
          zeroline: false
        },
      };


      Plotly.newPlot(container, traces, layout, options);
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
}

window.BoxPlot = BoxPlot;