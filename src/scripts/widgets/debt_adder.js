'use strict';

define(['react', 'database', 'widgets/db_list_mixin'], function(React, Database, DbListMixin) {

    return React.createClass({
        displayName: 'AmountAdder',

        mixins: [DbListMixin('account')],

        getInitialState: function() {
            return { selectedAccount: null,  done: false, isSubmitting: false, error: null };
        },

        onAccountChange: function() {

            var selected = this.refs['accountDropDown'].getDOMNode();
            var accountId = selected.options[selected.selectedIndex].value;

            if (accountId === 'NA')
                accountId = null;

            this.setState({ selectedAccount: accountId });

            //var accountName =
        },

        handleAdd: function() {

            if (!this.state.selectedAccount) {
                this.setState( { isSubmitting: false, error: 'No account has been selected' });
                return false;
            }

            var out = this.refs['outgoing'].getDOMNode().checked;
            var inc = this.refs['incoming'].getDOMNode().checked;


            if (!out && !inc) {
                this.setState( { isSubmitting: false, error: 'No direction has been selected '});
                return false;
            }
            var account = this.state.selectedAccount;
            var direction = out ? 'outgoing' : 'incoming';
            var amount = parseFloat(this.refs['amount'].getDOMNode().value);
            var currency = this.refs['currency'].getDOMNode().value;
            var description = this.refs['description'].getDOMNode().value;


            this.setState({ isSubmitting: true, error: null });

            var self = this;
            Database.addDebt(this.state.selectedAccount, direction, amount, currency, description, function(err, response) {
                if (!self.isMounted()) return;

                if (err) {
                    return self.setState({ isSubmitting: false, error: 'Got error trying to insert: ' + err.toString() });
                }

                self.setState({ isSubmitting: false, done: true });
            });

            return false;
        },

        dropDown: function() {
            var self = this;
            var list = Object.keys(self.state.dbList).map(function (k) {
                var value = self.state.dbList[k];

                return React.DOM.option({ key: k, value: k }, value.name);
            });

            list.unshift(React.DOM.option({ key: 'NA', value: 'NA' }, '-Please Select an Account-'));

            return React.DOM.select({ ref: 'accountDropDown', onChange: this.onAccountChange, required: true }, list);
        },

        render: function() {

            if (this.state.done)
                return React.DOM.p(null, 'Debt Added!');

            var selectedName;
            if (this.state.selectedAccount) {
                var account = this.state.dbList[this.state.selectedAccount];
                console.log('account: ', account);
                selectedName = account ? account.name : '...';
            } else {
                selectedName = '...';
            }

            return (
                 React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add Debt'),
                    (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                    React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Account:'),
                            React.DOM.td(null, this.dropDown())
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Direction:'),
                            React.DOM.td(null,
                                React.DOM.input({ ref: 'incoming', type: 'radio', name: 'direction', id: 'incoming', value: 'incoming'}),
                                React.DOM.label({ htmlFor: 'incoming'}, selectedName, ' owes me'),
                                React.DOM.br({}),
                                React.DOM.input({ ref: 'outgoing', type: 'radio', name: 'direction', id: 'outgoing', value: 'outgoing'}),
                                React.DOM.label({ htmlFor: 'outgoing'}, 'I owe ', selectedName)
                            )
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Amount:'),
                            React.DOM.td(null, React.DOM.input({ ref: 'amount', placeholder: 'amount', type: 'number', step: 'any', min: 0, required: true }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Currency:'),
                            React.DOM.td(null, React.DOM.input({ ref: 'currency', placeholder: 'currency', type: 'text', required: true }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Description:'),
                            React.DOM.td(null, React.DOM.textarea({ ref: 'description', placeholder: 'Description...' }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, ''),
                            React.DOM.td(null, React.DOM.input({ type: 'submit', value: 'Add account!' }))
                        )
                    )
                 )
            );
        }
    });
});