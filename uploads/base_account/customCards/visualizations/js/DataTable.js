'use strict';

class DataTable {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    console.log("Data table");
    $(container).css('padding', '5px');
    this.createPlaceHolderTable(container, Object.keys(input.data.schema.attributes));
    this.createDataTable(container, $(container).height(), input.data.data.map(function(data) {
      return data.slice(1)
    }));
    this.nonTableCompHeight = $(container).find(".row").eq(0).height() +
      $(container).find(".row").eq(2).height() +
      $(container).find('.dataTables_scrollHead').height();


    this.createPlaceHolderTable(container, Object.keys(input.data.schema.attributes));
    this.createDataTable(container, $(container).height() - this.nonTableCompHeight, input.data.data.map(function(data) {
      return data.slice(1)
    }));

  }

  update(container, input, state, dataHandler, setProperty) {
    this.init(container, input, state, dataHandler, setProperty);
  }

  createPlaceHolderTable(container, headAttributes) {
    $(container).empty();
    var table = d3.select($(container)[0]).append('table').attr("class", "table table-striped display compact").style("margin-bottom", 0).style("width", "100%");
    var thead = table.append('thead').attr("class", "thead-light");
    headAttributes.splice(headAttributes.indexOf("unique_index"), 1);

    thead.append('tr')
      .selectAll('th')
      .data(headAttributes).enter()
      .append('th')
      .text(function(column) {
        return column;
      });
  }

  createDataTable(container, height, data) {
    $(container).find('table').dataTable({
      data: data,
      lengthChange: false,
      pageLength: 20,
      autoWidth: true,
      scrollY: height,
      responsive: true,
      pagingType: "simple"
    });
  }
}

window.DataTable = DataTable;