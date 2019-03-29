function mergeValue(state, path, value) {
    if (path.length > 1) {
        var pathName = path.shift();
        return Object.assign({}, state, {[pathName]: mergeValue(state[pathName], path, value)});
    }
    else {
        if(value !== null && typeof value === 'object') {
            return Object.assign({}, state, {[path.shift()]: value});
        }
        else if(Array.isArray(value)) {
            return Object.assign({}, state, {[path.shift()]: value.concat([])});
        }
        else{
            return Object.assign({}, state, {[path.shift()]: value});
        }
    }
}

module.exports = mergeValue;