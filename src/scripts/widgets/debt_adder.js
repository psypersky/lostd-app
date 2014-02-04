'use strict';

define(['assert', 'react', 'database', 'widgets/contact_selector'], function(assert, React, Database, ContactSelector) {

    return React.createClass({
        displayName: 'AmountAdder',

        getInitialState: function() {
            return { selectedContact: null,  done: false, isSubmitting: false, error: null };
        },

        onContactChange: function(contact) {
            this.setState({ selectedContact: contact });
        },

        handleAdd: function() {

            var out = this.refs['outgoing'].getDOMNode().checked;
            var inc = this.refs['incoming'].getDOMNode().checked;


            if (!out && !inc) {
                this.setState( { isSubmitting: false, error: 'No direction has been selected '});
                return false;
            }
            var contact = this.state['selectedContact']._id;
            assert(contact);
            var direction = out ? 'outgoing' : 'incoming';
            var amount = parseFloat(this.refs['amount'].getDOMNode().value);
            var currency = this.refs['currency'].getDOMNode().value;
            var description = this.refs['description'].getDOMNode().value;


            this.setState({ isSubmitting: true, error: null });

            var self = this;
            Database.addDebt(this.state['selectedContact']._id, direction, amount, currency, description, function(err) {
                if (!self.isMounted()) return;

                if (err) {
                    return self.setState({ isSubmitting: false, error: 'Got error trying to insert: ' + err.toString() });
                }

                self.setState({ isSubmitting: false, done: true });
            });

            return false;
        },

        render: function() {

            if (this.state.done)
                return React.DOM.p(null, 'Debt Added!');

            var selectedName = this.state['selectedContact'] ? this.state['selectedContact'].name : '...';

            return (
                 React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add Debt'),
                    (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                    React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Contact:'),
                            React.DOM.td(null, ContactSelector({ onSelectedChange: this.onContactChange }))
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