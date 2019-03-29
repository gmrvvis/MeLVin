'use strict';

class Network {

  constructor() {}

  init(container, input, state, dataHandler, setProperty) {
    this.play = true;
    this.propSelection = [];
    var self = this;
    console.log("Network");
    $(container).css("cursor", "move");
    $(container).html(
      '<div class="graph-container w-100 h-100 position-absolute" style="margin: 0; overflow: hidden"></div>' +
      '<div class="graph-overlay w-100 h-100 position-absolute" style="display: none; left: 0; top: 0;">' +
      '<div class="graph-selection-indicator position-absolute" style="background: transparent; border: 1px solid orange"></div>' +
      '</div>' +
      '<div class="graph-controls position-absolute" style="top: 5px; right: 5px; margin: 5px; display: flex;">' +
      ' <div class="mr-3" style="background-color: #cfd7db; border-radius: 3px;     border: 1px solid #b5b5b5;">' +
      '  <i class="fa fa-pause p-2 net-step-btn" style="cursor: pointer; border-radius: 3px; color: #000000;"/>' +
      ' </div>' +
      ' <div class="mr-3" style="background-color: #cfd7db; border-radius: 3px;     border: 1px solid #b5b5b5;">' +
      '  <i class="fa fa-arrows-alt p-2 net-move-btn" style="cursor: pointer; border-radius: 3px; background-color: #2196F3; color: white;"/>' +
      ' <i class="fa fa-object-group p-2 net-select-btn"  style="cursor: pointer; border-radius: 3px;"/>' +
      ' </div>' +
      ' <div style="background-color: #cfd7db; border-radius: 3px; border: 1px solid #b5b5b5;">' +
      '  <i class="fa fa-search-plus p-2 net-zoomin-btn"  style="cursor: pointer; border-radius: 3px; color: #000000;"/>' +
      '  <i class="fa fa-search-minus p-2 net-zoomout-btn"  style="cursor: pointer; border-radius: 3px; color: #000000;"/>' +
      ' </div>' +
      '</div>' +
      '</div>'
    );
    var graph = Viva.Graph.graph();
    input.data.data[0].forEach(function(data) {
      graph.addNode(data[1]);
    });

    input.data.data[1].forEach(function(data) {
      graph.addLink(data[1], data[2], {
        connectionStrength: data[3]
      });
    });

    var layout = Viva.Graph.Layout.forceDirected(graph, {
      springLength: 200,
      springCoeff: 0.00001,
      dragCoeff: 0.1,
      gravity: -20,
      stableThreshold: 1,
      springTransform: function(link, spring) {
        spring.length = 200 * link.data.connectionStrength;
      }
    });

    var graphics = Viva.Graph.View.webglGraphics();

    graphics
      .node(function(node) {
        return Viva.Graph.View.webglSquare(40, "#3665bf");
      })

    var renderer = Viva.Graph.View.renderer(graph, {
      layout: layout,
      graphics: graphics,
      container: $(container).find('.graph-container')[0]
    });
    var multiSelectOverlay;

    renderer.run();

    $(container).find('.net-step-btn').on('click', function() {
      if (self.play) {
        $(container).find('.net-step-btn').removeClass('fa-pause').addClass('fa-play');
        renderer.pause();
        self.play = false;
      } else {
        $(container).find('.net-step-btn').removeClass('fa-play').addClass('fa-pause');
        renderer.resume();
        self.play = true;
      }
    });

    $(container).find('.net-zoomin-btn').on('click', function() {
      renderer.zoomIn();
    });

    $(container).find('.net-zoomout-btn').on('click', function() {
      renderer.zoomOut();
    });

    $(container).find('.net-select-btn').on('click', function() {
      $(this).css('background-color', '#2196F3').css('color', 'white');
      $(container).find('.net-move-btn').css('background-color', 'transparent').css('color', 'black');
      $(container).css("cursor", "crosshair");
      multiSelectOverlay = startMultiSelect(container, graph, renderer, layout);
    });

    $(container).find('.net-move-btn').on('click', function() {
      $(this).css('background-color', '#2196F3').css('color', 'white');
      $(container).find('.net-select-btn').css('background-color', 'transparent').css('color', 'black');
      $(container).css("cursor", "move");
      multiSelectOverlay.destroy();
      multiSelectOverlay = null;
    });

    function startMultiSelect(container, graph, renderer, layout) {
      var graphics = renderer.getGraphics();
      var domOverlay = container.querySelector('.graph-overlay');
      var overlay = createOverlay(domOverlay, container);
      overlay.onAreaSelected(handleAreaSelected);

      return overlay;

      function handleAreaSelected(area) {
        // For the sake of this demo we are using silly O(n) implementation.
        // Could be improved with spatial indexing if required.
        var topLeft = graphics.transformClientToGraphCoordinates({
          x: area.x,
          y: area.y
        });

        var bottomRight = graphics.transformClientToGraphCoordinates({
          x: area.x + area.width,
          y: area.y + area.height
        });
        self.propSelection = [];
        graph.forEachNode(higlightIfInside);
        renderer.rerender();

        return;

        function higlightIfInside(node) {
          var nodeUI = graphics.getNodeUI(node.id);
          if (isInside(node.id, topLeft, bottomRight)) {
            nodeUI.color = 0xff2d0fff;
            nodeUI.size = 40;
            self.propSelection.push(node.id);
          } else {
            nodeUI.color = 0x3665bfff;
            nodeUI.size = 40;
          }
        }

        function isInside(nodeId, topLeft, bottomRight) {
          var nodePos = layout.getNodePosition(nodeId);
          return (topLeft.x < nodePos.x && nodePos.x < bottomRight.x &&
            topLeft.y < nodePos.y && nodePos.y < bottomRight.y);
        }
      }
    }

    function createOverlay(overlayDom, container) {
      var selectionClasName = 'graph-selection-indicator';
      var selectionIndicator = overlayDom.querySelector('.' + selectionClasName);
      if (!selectionIndicator) {
        selectionIndicator = document.createElement('div');
        selectionIndicator.className = selectionClasName;
        overlayDom.appendChild(selectionIndicator);
      }

      var notify = [];
      var dragndrop = Viva.Graph.Utils.dragndrop(overlayDom);
      var selectedArea = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
      var startX = 0;
      var startY = 0;

      dragndrop.onStart(function(e) {
        startX = selectedArea.x = e.offsetX;
        startY = selectedArea.y = e.offsetY;
        selectedArea.width = selectedArea.height = 0;

        updateSelectedAreaIndicator();
        selectionIndicator.style.display = 'block';
      });

      dragndrop.onDrag(function(e) {
        recalculateSelectedArea(e);
        updateSelectedAreaIndicator();
        notifyAreaSelected();
      });

      dragndrop.onStop(function() {
        selectionIndicator.style.display = 'none';
        setProperty("propSelection", self.propSelection);
        console.log(self.propSelection)
      });

      overlayDom.style.display = 'block';

      return {
        onAreaSelected: function(cb) {
          notify.push(cb);
        },
        destroy: function() {
          overlayDom.style.display = 'none';
          dragndrop.release();
        }
      };

      function notifyAreaSelected() {
        notify.forEach(function(cb) {
          cb(selectedArea);
        });
      }

      function recalculateSelectedArea(e) {
        selectedArea.width = Math.abs(e.offsetX - startX);
        selectedArea.height = Math.abs(e.offsetY - startY);
        selectedArea.x = Math.min(e.offsetX, startX);
        selectedArea.y = Math.min(e.offsetY, startY);
      }

      function updateSelectedAreaIndicator() {
        selectionIndicator.style.left = selectedArea.x + 'px';
        selectionIndicator.style.top = selectedArea.y + 'px';
        selectionIndicator.style.width = selectedArea.width + 'px';
        selectionIndicator.style.height = selectedArea.height + 'px';
      }
    }

    setTimeout(function() {
      renderer.pause();
      $(container).find('.net-step-btn').removeClass('fa-pause').addClass('fa-play');
      self.play = false;
    }, 7000);

  }

  update(container, input, state, dataHandler, setProperty) {
    this.init(container, input, state, dataHandler, setProperty);
  }
}

window.Network = Network;