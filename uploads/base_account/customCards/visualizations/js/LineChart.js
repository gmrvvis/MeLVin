'use strict';

class LineChart {

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

    var data = input.data.data;
    var attributes = input.data.schema.attributes;
    var allAttributes = Object.keys(attributes).slice();
    var idIndex = 0;
    var horizontalAttrName = state.options[0].value;
    var horizontalAttrIndex = allAttributes.indexOf(horizontalAttrName);

    var seriesAttrsName = state.options[1].value;
    var seriesAttrsIndex = state.options[1].value.map(function(attr) {
      return allAttributes.indexOf(attr);
    });


    var traces = [];


    allAttributes.splice(horizontalAttrIndex, 1);
    allAttributes.splice(0, 1);

    if (state.options[2].selectedIndex === "1") {
      data.map(function(data) {
        if (input.groups && input.groups.dataMemb && input.groups.dataMemb[data[0]]) {
          var currentData = data.slice();
          currentData.splice(horizontalAttrIndex, 1);
          currentData.splice(idIndex, 1);
          traces.push({
            x: allAttributes,
            y: currentData,
            mode: 'lines',
            name: data[horizontalAttrIndex],
            line: {
              shape: 'linear'
            },
            type: 'scatter'
          })
        }
      });
    } else {
      var x = data.map(function(data) {
        return data[horizontalAttrIndex]
      });

      var dataSeries = [];

      seriesAttrsIndex.forEach(function(dataIndex) {
        dataSeries.push(data.map(function(dataItem, i) {
          return dataItem[dataIndex];
        }));
      });

      dataSeries.forEach(function(serie, i) {
        traces.push({
          x: x,
          y: serie,
          mode: 'lines',
          name: seriesAttrsName[i],
          line: {
            shape: 'linear'
          },
          type: 'scatter'
        })
      })
    }

    var layout = {
      margin: {
        l: 50,
        r: 30,
        b: 30,
        t: 30,
        pad: 5
      },
      autosize: true,
      dragmode: "pan",
      showlegend: true,
      legend: {
        y: 0.5,
        traceorder: 'reversed',
        font: {
          size: 16
        },
        yref: 'paper'
      },
      xaxis: {
        showticklabels: false
      },
    };

    Plotly.newPlot(container, traces, layout, options);
  }

  update(container, input, state, dataHandler, setProperty) {
    this.init(container, input, state, dataHandler, setProperty);
  }
}

window.LineChart = LineChart;