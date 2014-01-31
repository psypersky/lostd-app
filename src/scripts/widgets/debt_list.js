'use strict';

define(['react', 'widgets/db_list_mixin'], function(React, DbListMixin) {

    return React.createClass({
        displayName: 'DebtList',

        mixins: [DbListMixin('debt')],

        render: function() {

            var self = this;

            if (this.state.dbListLoaded && Object.keys(self.state.dbList).length === 0) {
                return React.DOM.p(null,
                    'You have no debts! Perhaps you should add some!'
                );
            }

            var list = Object.keys(self.state.dbList).map(function (k) {
                var value = self.state.dbList[k];

                return React.DOM.tr({ key: k },
                    React.DOM.td(null, value.tab),
                    React.DOM.td(null, value.direction),
                    React.DOM.td(null, value.amount),
                    React.DOM.td(null, value.currency),
                    React.DOM.td(null, value.description)
                );
            });

            list.unshift(React.DOM.tr({ key: 'header' },
                React.DOM.th(null, 'Tab'),
                React.DOM.th(null, 'Direction'),
                React.DOM.th(null, 'Amount'),
                React.DOM.th(null, 'Currency'),
                React.DOM.th(null, 'Description')
            ));

            return React.DOM.div(null,
                React.DOM.h2(null, 'Debt Info'),
                React.DOM.table({ id: 'infoTable' }, list)
            );
        }
    });


})