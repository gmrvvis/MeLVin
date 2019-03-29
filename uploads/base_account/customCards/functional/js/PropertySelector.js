function process(input, state, dataHandler, setResult, setProgress) {
  var options = state.options;
  
  var data = dataHandler.getData();

  if (input.propSelection) {
    var groups = input.propSelection.map(function(prop) {
      return {
        name: prop,
        color: '#ff0000',
        points: {}
      }
    });

    var dataMemb = {};

    data.forEach(function(data) {
      var dataString = '$|$' + data.join('$|$') + '$|$';
      input.propSelection.forEach(function(prop, i) {
        if (dataString.indexOf('$|$' + prop + '$|$') !== -1) {
          groups[i].points[data[0]] = true;
          dataMemb[data[0]] = 'prop';
        }
      });
    });

    groups = groups.filter(function(group) {
      return Object.keys(group.points).length > 0;
    });

    setResult({
      "groups": {
        dataMemb: dataMemb,
        groups: groups
      }
    });
  } else {
    setResult({});
  }
}