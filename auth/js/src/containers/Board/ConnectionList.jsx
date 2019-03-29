'use strict';

var React = require('react');
var ConnectionTypes = require('./../../constants/ConnectionTypes');

module.exports = React.createClass({

    render: function () {
        var selectedID = this.props.selectedID;
        var self = this;

        return (
            <div className="card mb-3">
                <div className="card-header font-bold d-flex"
                     onMouseEnter={function () {
                         return self.props.highlightHandler(self.props.connectionsIds)
                     }}
                     onMouseLeave={function () {
                         return self.props.unHighlightHandler(self.props.connectionsIds)
                     }}>
                    <h6 className="mr-auto mb-0 align-self-center">{this.props.title}</h6>
                    <button className="fa fa-trash-alt btn btn-danger btn-sm"
                            onClick={function () {
                                return self.props.removeHandler(self.props.connectionsIds)
                            }}/>
                </div>
                <table
                    className="table table-hover table-right mb-0">
                    <thead>
                    <tr>
                        <th className="border-bottom-0 border-top-0" style={{width: "10%"}}>ID</th>
                        <th className="border-bottom-0 border-top-0" style={{width: "70%"}}>Type</th>
                        <th className="border-bottom-0 border-top-0" style={{width: "20%"}}>Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        ConnectionTypes.types.map(function (connCategory) {
                            var connectionIDs = Object.keys(self.props.connectionsByType[connCategory]);
                            var connections = [
                                connectionIDs.map(function (connectionID) {
                                    var connection = self.props.connectionsByType[connCategory][connectionID];
                                    var card = self.props.cards.byId[connection[self.props.destinationProp]];
                                    return (
                                        <tr onMouseEnter={function () {
                                            return self.props.highlightHandler([connection.id])
                                        }}
                                            onMouseLeave={function () {
                                                return self.props.unHighlightHandler([connection.id])
                                            }}>
                                            <td>{card.id}</td>
                                            <td>{card.title}</td>
                                            <td>
                                                <button
                                                    className="fa fa-times  btn btn-danger btn-sm"
                                                    onClick={function () {
                                                        return self.props.removeHandler([connection.id])
                                                    }}/>
                                            </td>
                                        </tr>
                                    )
                                })];

                            if (connectionIDs.length > 0)
                                connections.unshift(
                                    <tr className="bg-white text-dark">
                                        <th colSpan={3} className="active text-center bg-light text-dark"><span
                                            className="fa">{ConnectionTypes.icons[connCategory]}</span>{" " + ConnectionTypes.labels[connCategory]}
                                        </th>
                                    </tr>
                                );

                            return connections;
                        })


                    }
                    </tbody>
                </table>
            </div>
        )
    }

});
