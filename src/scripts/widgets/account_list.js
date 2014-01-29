'use strict';

define(['react', 'widgets/account', 'widgets/db_list_mixin'], function(React, Account, DbListMixin) {

    return React.createClass({
        displayName: 'AccountList',

        mixins: [DbListMixin('account')],

        getInitialState: function() {
            return { dbList: {}, dbListLoaded: false };
        },


        render: function() {

            var self = this;

            if (this.state.dbListLoaded && Object.keys(self.state.dbList).length === 0) {
                return React.DOM.p(null,
                    'You have no accounts! You should add one!'
                );
            }

            var list = Object.keys(self.state.dbList).map(function (k) {
                var value = self.state.dbList[k];

                return Account({ key: k, rev: value._rev, name: value.name, description: value.description });
            });

            return React.DOM.div(null,
                React.DOM.h2(null, 'All Accounts'),
                list);
        }
    });


})