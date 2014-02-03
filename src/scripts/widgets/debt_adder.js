'use strict';

define(['react', 'database', 'widgets/db_list_mixin'], function(React, Database, DbListMixin) {

    return React.createClass({
        displayName: 'AmountAdder',

        mixins: [DbListMixin('contact')],

        getInitialState: function() {
            return { selectedContact: null,  done: false, isSubmitting: false, error: null };
        },

        onContactChange: function() {

            var selected = this.refs['contactDropDown'].getDOMNode();
            var contactId = selected.options[selected.selectedIndex].value;

            if (contactId === 'NA')
                contactId = null;

            this.setState({ selectedContact: contactId });

        },

        handleAdd: function() {

            if (!this.state['selectedContact']) {
                this.setState( { isSubmitting: false, error: 'No contact has been selected' });
                return false;
            }

            var out = this.refs['outgoing'].getDOMNode().checked;
            var inc = this.refs['incoming'].getDOMNode().checked;


            if (!out && !inc) {
                this.setState( { isSubmitting: false, error: 'No direction has been selected '});
                return false;
            }
            var contact = this.state['selectedContact'];
            var direction = out ? 'outgoing' : 'incoming';
            var amount = parseFloat(this.refs['amount'].getDOMNode().value);
            var currency = this.refs['currency'].getDOMNode().value;
            var description = this.refs['description'].getDOMNode().value;


            this.setState({ isSubmitting: true, error: null });

            var self = this;
            Database.addDebt(this.state['selectedContact'], direction, amount, currency, description, function(err, response) {
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

            list.unshift(React.DOM.option({ key: 'NA', value: 'NA' }, '-Select a Contact-'));

            return React.DOM.select({ ref: 'contactDropDown', onChange: this.onContactChange, required: true }, list);
        },

        render: function() {

            if (this.state.done)
                return React.DOM.p(null, 'Debt Added!');

            var selectedName;
            if (this.state['selectedContact']) {
                var contact = this.state.dbList[this.state['selectedContact']];
                selectedName = contact ? contact.name : '...';
            } else {
                selectedName = '...';
            }

            return (
                 React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add Debt'),
                    (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                    React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Contact:'),
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
                            React.DOM.td(null, React.DOM.input({ type: 'submit', value: 'Add debt!' }))
                        )
                    )
                 )
            );
        }
    });
});