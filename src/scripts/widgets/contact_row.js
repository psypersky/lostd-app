'use strict';

define(['react', 'database'], function(React, Database) {

    return React.createClass({
        displayName: 'ContactRow',

        getInitialState: function() {
            return { error: null, isDeleting: false };
        },

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
                if (value === undefined)
                    value = ' ';
                tds.push(React.DOM.td({ key: currency }, value));
            }

            return  React.DOM.tr({onClick: this.props.onClick},
                React.DOM.th(null, this.props.object.name),
                tds);
        }
    });

});
