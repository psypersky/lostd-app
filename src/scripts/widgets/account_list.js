'use strict';

define(['react', 'widgets/account', 'widgets/account_list_mixin'], function(React, Account, AccountListMixin) {

    return React.createClass({
        displayName: 'AccountList',

        mixins: [AccountListMixin],

        getInitialState: function() {
            return { accountList: {}, accountListLoaded: false };
        },


        render: function() {

            var self = this;

            if (this.state.accountListLoaded && Object.keys(self.state.accountList).length === 0) {
                return React.DOM.p(null,
                    'You have no accounts! You should add one!'
                );
            }

            var list = Object.keys(self.state.accountList).map(function (k) {
                var value = self.state.accountList[k];

                return Account({ key: k, rev: value._rev, name: value.name, description: value.description });
            });

            return React.DOM.div(null, list);
        }
    });


})