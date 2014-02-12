'use strict';

define(['react', 'database', 'util'], function(React, Database, util) {

    return React.createClass({
        displayName: 'ContactRow',

        propTypes: {
            onClick: React.PropTypes.func.isRequired,
            object: React.PropTypes.object.isRequired,
            currencyAmounts: React.PropTypes.object.isRequired, // These are the currencies that the contact has
            allCurrencies: React.PropTypes.object.isRequired, // all total currencies in use
        },

        render: function() {
            var self = this;

            var tds = [];
            for (var currency in this.props.allCurrencies) {
                var value = this.props.currencyAmounts[currency];
                tds.push( React.DOM.td({ key: currency }, value ?  util.formatNumber(value) : '') );
            }

            return  React.DOM.tr({onClick: this.props.onClick},
                React.DOM.th(null, this.props.object.name),
                tds);
        }
    });

});
