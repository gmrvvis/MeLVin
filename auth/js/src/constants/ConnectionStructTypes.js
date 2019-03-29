const types = {OBJECT: '0', STRING: '1', NUMERIC: '2', BOOL: '3', ARRAY: '4'};
const types_label = {OBJECT: 'Object', STRING: 'String', NUMERIC: 'Numeric', BOOL: 'Boolean', ARRAY: 'Array'};
const cssClass = {
    [types.OBJECT]: {letter: 'O', className: 'header-object'},
    [types.STRING]: {letter: 'S', className: 'header-string'},
    [types.NUMERIC]: {letter: 'N', className: 'header-number'},
    [types.BOOL]: {letter: 'B', className: 'header-boolean'},
    [types.ARRAY]: {letter: 'A', className: 'header-array'}
};

module.exports.types = types;
module.exports.types_label = types_label;
module.exports.cssClass = cssClass;
