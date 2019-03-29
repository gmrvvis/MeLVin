"use strict";

var React = require('react');
var StructElem = require('./StructureElem');
var structTypes = require('../../../constants/ConnectionStructTypes').types;
var StructureContainer = React.createClass({

    render: function () {
        var self = this;
        var addChild;
        var node = this.props.tree[this.props.id];
        if (node.type === structTypes.OBJECT)
            addChild = (
                    <li>
                        <button className="btn btn-sm btn-outline-secondary mt-3 p-3"
                                onClick={this.props.onAddChildren(this.props.id)}
                        ><i className="fa fa-plus"/> Add
                            property
                        </button>
                    </li>
            );

        var children;
        if (node.children)
            children = node.children.map(function (childId) {
                return <StructureContainer onAddChildren={self.props.onAddChildren}
                                           onOpenEditProperty={self.props.onOpenEditProperty}
                                           tree={self.props.tree} id={childId}
                                           onRemoveElem={self.props.onRemoveElem}
                />;
            });


        return (
                <li>
                    <StructElem onOpenEditProperty={self.props.onOpenEditProperty}
                                node={node}
                                onRemoveElem={self.props.onRemoveElem}/>
                    <ul>
                    {children}
                    {addChild}
                    </ul>
                </li>
        )
    }
});

module.exports = StructureContainer;