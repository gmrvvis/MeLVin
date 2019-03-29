'use strict';

class DataCategorizer {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    this.color = "#000";
    this.groups = input.groups || state.groups || [];
    var self = this;
    self.repaintGroups(container, setProperty);
    var addToGroupLB = "<div class='lb_addToGroup' style='display: none;position: absolute; background-color: rgba(0, 0, 0, 0.4);justify-content:  center; align-items:  center; width:  100%; height: 100%;'>" +
      "<div class='d-flex flex-column justify-content-center font-weight-bold text-left p-3' style='background-color:  #f5f5f5;min-height: 150px; width:  80%; border-radius: 3px; padding-top:0;'>" +
      "<button class='btn btn-sm btn-empty btn_closeAddToGroup align-self-end pb-2'>" +
      "<span class='fa fa-times'/>" +
      "</button>" +
      "<div class='pb-3'>" +
      "  <label>Select group</label>" +
      "  <select class='form-control groupSelection'>" +
      "  </select>" +
      "</div>" +
      "<button class='btn btn-primary btn_addToGroupConfirm'>Add to group</button>" +
      "</div>" +
      "</div>";

    var createGroupLB = "<div class='lb_createGroup' style='display: none;position: absolute; background-color: rgba(0, 0, 0, 0.4);justify-content:  center; align-items:  center; width:  100%; height: 100%;'>" +
      "<div class='d-flex flex-column justify-content-center font-weight-bold text-left p-3' style='background-color:  #f5f5f5; min-height: 220px;width:  80%; border-radius: 3px;'>" +
      "<button class='btn btn-sm btn-empty  btn_closeCreateGroup  align-self-end pb-2'>" +
      "<span class='fa fa-times'/>" +
      "</button>" +
      "<div class='pb-3'>" +
      "  <label>Group name</label>" +
      "  <input type='text' class='form-control groupName' >" +
      "</div>" +
      "<div class='pb-3'>" +
      "  <label>Color</label>" +
      "  <input type='color' style='height: 38px'  class='form-control groupColor'/>" +
      "</div>" +
      "<button class='btn btn-primary btn_createGroupConfirm'>Create group</button>" +
      "</div>" +
      "</div>";

    $(container).empty();
    $(container).css("overflow-x", "auto");
    $(container).css("overflow-y", "auto");
    $(container).css("display", "flex");
    $(container).css("flex-flow", "column");
    $(container).append(addToGroupLB + createGroupLB +
      "<div class='d-flex align-items-center w-100 p-3 justify-content-center' style='background-color: #fbfbfb;border-bottom: 1px solid #dddddd;'>" +
      " <span class='datagrouper_numSelected font-weight-bold'>No items selected</span>" +
      "</div>" +
      "<div class='d-flex align-items-center justify-content-between w-100 pl-3 pr-3 pt-2 pb-2' style='background-color: #fbfbfb;border-bottom: 1px solid #dddddd;'>" +
      " <h5 class='mb-0'>Selection</h5>" +
      " <div>" +
      "  <button class='btn btn-outline-primary btn-sm addToGroup_btn'><i class='fa fa-plus mr-1'/>Add to group</button>" +
      "  <button class='btn btn-outline-primary btn-sm createGroup_btn ml-3'><i class='fa fa-edit mr-1'/>Add to new group</button>" +
      " </div>" +
      "</div> " +
      "<div class='d-flex align-items-center justify-content-between w-100 pl-3 pr-3 pt-2 pb-2' style='background-color: #fbfbfb;border-bottom: 1px solid #dddddd;'>" +
      " <h5 class='mb-0'>Groups</h5>" +
      " <div>" +
      " <button class='btn btn-outline-danger btn-sm removeGroups_btn'><i class='fa fa-trash mr-1'/>Remove all groups</button>" +
      " </div>" +
      "</div> " +
      "<div class='groups groups flex-grow d-flex align-items-center w-100' style='background-color: #fff;border-bottom: 1px solid #dddddd;'>" +
      "</div>"
    );

    // "<div class='tableContent' style='padding:15px;display:flex;flex-grow:1;'>" +
    // "</div>");


    $(container).find('.removeGroups_btn').on('click', function() {
      self.groups = [];
      setProperty("groups", self.groups);
      self.repaintGroups(container, setProperty);
    });


    $(container).find('.addToGroup_btn').on('click', function() {
      $(container).find('.groupSelection').empty().append(
        self.groups.map(function(group) {
          return "<option>" + group.name + "</option>";
        }).join('')
      );
      $(container).find('.lb_addToGroup').css("display", "flex");
    });

    $(container).find('.createGroup_btn').on('click', function() {
      $(container).find('.lb_createGroup').css("display", "flex");
    });

    $(container).find('.btn_closeAddToGroup').on('click', function() {
      $(container).find('.lb_addToGroup').css("display", "none");
    });

    $(container).find('.btn_closeCreateGroup').on('click', function() {
      $(container).find('.lb_createGroup').css("display", "none");
    });

    $(container).find('.groupColor').on('change', this.changeColor());


    $(container).find('.btn_createGroupConfirm').on('click', function() {
      var name = $(container).find('.groupName').prop("value");
      var color = self.color;
      self.groups.push({
        name: name,
        color: color,
        points: Object.assign({}, self.selectedIDs)
      });

      $(container).find('.groups').text($(container).find('.groups').text() + " " + name);
      $(container).find('.lb_createGroup').css("display", "none");
      self.repaintGroups(container, setProperty);
      setProperty("groups", self.groups)
    });

    $(container).find('.btn_addToGroupConfirm').on('click', function() {
      var groupName = $(container).find('.groupSelection').prop("value");
      self.groups.forEach(function(group) {
        if (group.name === groupName) {
          group.points = Object.assign({}, group.points, self.selectedIDs);
        }
      });
      $(container).find('.lb_addToGroup').css("display", "none");
      setProperty("groups", self.groups)

    });

    d3.select($(container).find('.groups')[0]).selectAll("span")
      .data(this.groups).enter().append("span").text(function(d) {
        return d.name;
      });


    this.repaintGroups(container, setProperty);
  }

  update(container, input, state, dataHandler, setProperty) {
    console.log("update");

    var selectedIDs = {};
    input.selection.forEach(function(selection) {
      Object.assign(selectedIDs, selection.points)
    });

    this.selectedIDs = selectedIDs;
    var numSelected = Object.keys(selectedIDs).length;
    this.repaintGroups(container, setProperty);
    if (numSelected > 0) {
      $(container).find(".datagrouper_numSelected").text(numSelected + " items selected");
      /*  d3.select(container).selectAll('tr').style("background-color", function (d) {
            if (d && selectedIDs[d[0]]) {
                return "#a6c9e7";
            } else
                return null;
        })
            .sort(function (first, second) {
                return first && second ? selectedIDs[first[0]] && selectedIDs[second[0]] ? 0 : selectedIDs[first[0]] ? -1 : 1 : -1;
            });
            */
    } else {
      $(container).find(".datagrouper_numSelected").text("No items selected");
    }
  }

  repaintGroups(container, setProperty) {
    $(container).find('.groups').empty().append(
      this.groups.map(function(group) {
        return "<div style='padding: 6px 10px; background-color:  white; margin: 8px 8px 8px 16px; border: 1px solid #dddddd;float: left;'>" +
          "<span class='fa fa-square' style='color:" + group.color + ";'></span>" +
          "<span style='font-size: 14px;font-weight:  bold;'> " +
          group.name +
          "</span>" +
          "<span class='far fa-edit' style='color: #373737;margin-left: 26px;font-size: 12px;cursor:  pointer;'/>" +
          "<span class='far fa-trash-alt removeGroup' data-group-name='" + group.name + "' style='color: #373737;padding-left: 6px;font-size: 12px;cursor:  pointer;'/>" +
          "</div>"
      })
    );
    var self = this;
    $(container).find('.removeGroup').on('click', function() {
      var name = $(this).attr("data-group-name");
      var index = -1;
      for (var i = 0; i < self.groups.length; i++)
        if (self.groups[i].name === name)
          index = i;

      if (index > -1)
        self.groups.splice(index, 1);

      setProperty("groups", self.groups);

      self.repaintGroups(container, setProperty);
    });
  }

  changeColor() {
    var self = this;
    return function(event) {
      self.color = event.target.value;
    };
  }
}

window.DataCategorizer = DataCategorizer;