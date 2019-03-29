'use strict';

class VegaHeatmap {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    $(container).html("");

    var attributes = input.data.schema.attributes;
    var columns = [];
    state.options[1].value.forEach(function(value) {
      columns.push(value);
    });

    var hCol = state.options[0].value;
    var hColIndex = Object.keys(attributes).indexOf(hCol);
    var columnsIndex = columns.map(function(columnName) {
      return Object.keys(attributes).indexOf(columnName);
    });

    var values = [];

    input.data.data.forEach(function(data) {
      if (input.groups && input.groups.dataMemb && input.groups.dataMemb[data[0]]) {
        columnsIndex.forEach(function(index, i) {
          values.push({
            rownames: data[hColIndex],
            colname: columns[i],
            value: data[index]
          })
        })
      }
    });

    var options = {
      "renderer": "svg"
    };

    var spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v2.json",

      "data": {
        "values": values
      },
      "width": container.clientWidth,
      "height": container.clientHeight,
      "mark": "rect",
      "encoding": {
        "y": {
          "field": "rownames",
          "type": "nominal"
        },
        "x": {
          "field": "colname",
          "type": "nominal",
          "axis": false
        },
        "color": {
          "field": "value",
          "type": "quantitative",
          "legend": {
            "gradientLength": container.clientHeight * 0.95
          }
        },
        "tooltip": [{
            "field": "rownames",
            "type": "nominal"
          },
          {
            "field": "colname",
            "type": "nominal"
          },
          {
            "field": "value",
            "type": "quantitative"
          }
        ]
      },
      "config": {
        "scale": {
          "bandPaddingInner": 0,
          "bandPaddingOuter": 0
        },
        "text": {
          "baseline": "middle"
        }
      }
    };
    vegaEmbed(container, spec, options).then(function(result) {}).catch(console.error);

    $(container).children('div').remove();
    var svg = $(container).children('svg');
    var newHeight = container.clientHeight - (svg.height() - container.clientHeight);
    var newWidth = container.clientWidth - (svg.width() - container.clientWidth);

    spec.width = newWidth;
    spec.height = newHeight;
    $(container).empty();
    vegaEmbed(container, spec, options).then(function(result) {}).catch(console.error);
    var legend = $(container).find('g.mark-rect.role-legend-gradient path');
    legend.css('fill', legend.css('fill').replace('##', '#'));
  }

  update(container, input, state, dataHandler, setProperty) {
    this.init(container, input, state, dataHandler, setProperty);
  }
}

window.VegaHeatmap = VegaHeatmap;