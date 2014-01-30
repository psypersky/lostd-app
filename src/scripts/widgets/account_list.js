'use strict';

define(['react', 'widgets/account', 'widgets/db_list_mixin'], function(React, Account, DbListMixin) {

    return React.createClass({
        displayName: 'AccountList',

        mixins: [DbListMixin('account')],

        render: function() {

            var self = this;

            var component;

            if (this.state.dbListLoaded && Object.keys(self.state.dbList).length === 0) {
                component =  React.DOM.p(null, 'You have no accounts! You should add one!');
            } else {
                component = Object.keys(self.state.dbList).map(function (k) {
                    var value = self.state.dbList[k];

                    return Account({ key: k, rev: value._rev, name: value.name, description: value.description });
                });
            }

            return React.DOM.div(null,
                React.DOM.h2(null, 'All Accounts'),
                component);
        }
    });


})