'use strict';

define(['assert', 'react', 'database', 'widgets/contact_selector'], function(assert, React, Database, ContactSelector) {

    return React.createClass({
        displayName: 'RecordAdder',

        getInitialState: function() {
            return { selectedContact: null,  done: false, isSubmitting: false, error: null };
        },

        onContactChange: function(contact) {
            this.setState({ selectedContact: contact });
        },

        handleAdd: function() {
            var contact = this.state['selectedContact']._id;
            assert(contact);

            var recordType;
            if (this.refs['owes_me'].getDOMNode().checked)
                recordType = 'owes_me';
            else if (this.refs['i_owe'].getDOMNode().checked)
                recordType = 'i_owe';
            else if (this.refs['paid_me'].getDOMNode().checked)
                recordType = 'paid_me';
            else if (this.refs['i_paid'].getDOMNode().checked)
                recordType = 'i_paid';
            else
                assert(!'Unselected record type');

            var amount = parseFloat(this.refs['amount'].getDOMNode().value);
            assert(amount > 0);

            if (recordType === 'i_owe' || recordType === 'paid_me')
                amount *= -1;

            var currency = this.refs['currency'].getDOMNode().value.trim();
            var description = this.refs['description'].getDOMNode().value;


            this.setState({ isSubmitting: true, error: null });

            var self = this;
            Database.addRecord(this.state['selectedContact']._id, recordType, amount, currency, description, function(err) {
                if (err)
                    console.error('Error adding record: ', err);

                if (!self.isMounted()) return;

                if (err)
                    self.setState({ isSubmitting: false, error: 'Got error trying to insert: ' + err.toString() });
                else
                    self.setState({ isSubmitting: false, done: true });
            });

            return false;
        },

        render: function() {

            if (this.state.done)
                return React.DOM.p(null, 'Record Added!');

            var selectedName = this.state['selectedContact'] ? this.state['selectedContact'].name : '...';

            return (
                 React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add Record'),
                    (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                    React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Contact:'),
                            React.DOM.td(null, ContactSelector({ onSelectedChange: this.onContactChange }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Type:'),
                            React.DOM.td(null,
                                React.DOM.input({ ref: 'owes_me', type: 'radio', name: 'record_type', id: 'owes_me', value: 'owes_me', required: true }),
                                React.DOM.label({ htmlFor: 'owes_me'}, selectedName, ' owes me'),
                                React.DOM.br({}),
                                React.DOM.input({ ref: 'i_owe', type: 'radio', name: 'record_type', id: 'i_owe', value: 'i_owe'}),
                                React.DOM.label({ htmlFor: 'i_owe'}, 'I owe ', selectedName),
                                React.DOM.br({}),
                                React.DOM.input({ ref: 'i_paid', type: 'radio', name: 'record_type', id: 'i_paid', value: 'i_paid'}),
                                React.DOM.label({ htmlFor: 'i_paid'}, 'I paid ', selectedName),
                                React.DOM.br({}),
                                React.DOM.input({ ref: 'paid_me', type: 'radio', name: 'record_type', id: 'paid_me', value: 'paid_me'}),
                                React.DOM.label({ htmlFor: 'paid_me'}, selectedName, ' paid me'),
                                React.DOM.br({})
                            )
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Amount:'),
                            React.DOM.td(null, React.DOM.input({ ref: 'amount', placeholder: 'amount', type: 'number', step: 'any', min: 0, required: true }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Currency:'),
                            React.DOM.td(null, React.DOM.input({ ref: 'currency', type: 'text', required: true }, 'Select a currency'))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Description:'),
                            React.DOM.td(null, React.DOM.textarea({ ref: 'description', placeholder: 'Description...' }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, ''),
                            React.DOM.td(null, React.DOM.input({ type: 'submit', value: 'Add record!' }))
                        )
                    )
                 )
            );
        }
    });
});