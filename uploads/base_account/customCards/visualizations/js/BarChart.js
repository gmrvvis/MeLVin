'use strict';

class BarChart {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    var objectFormattedData = dataHandler.getDataAsObject();

    var spec = {
      "height": $(container).height() - 80,
      "width": $(container).width() - 80,
      "data": {
        "values": objectFormattedData
      },
      "mark": "bar",
      "encoding": {
        "x": {
          "field": state.options[0].value,
          "type": "ordinal"
        },
        "y": {
          "field": state.options[1].value,
          "type": "quantitative",
          "aggregate": "mean"
        }
      }
    };

    vegaEmbed(container, spec)
  }

  update(container, input, state, dataHandler, setProperty) {
    this.init(container, input, state, dataHandler, setProperty);
  }
}

window.BarChart = BarChart;