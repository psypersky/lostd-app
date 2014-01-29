'use strict';

define(['react', 'database'], function(React, Database) {

    return React.createClass({
        displayName: 'AccountAdder',

        getInitialState: function() {
            return { done: false, isSubmitting: false, error: null };
        },

        handleAdd: function() {
            var self = this;
            var name = self.refs.accountName.getDOMNode().value.trim();
            if (!name) {
                this.setState({ error: 'No account name added!' });
                return false;
            }

            var description = self.refs.description.getDOMNode().value.trim();

            this.setState({ error: null, isSubmitting: true });

            Database.addAccount(name, description, function (err, response) {
                if (!self.isMounted()) return;

                if (err) {
                    self.setState({ isSubmitting: false, error: 'Encounted error: ' + err.toString()});
                } else {
                    console.log('Added new account: ', name, ' with response ', response);
                    self.setState({ isSubmitting: false, done: true });
                }
            });

            return false;
        },

        render: function() {
            if (this.state.done)
                return React.DOM.p(null, 'Account Added!');

            return (
                React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add account'),
                    (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                    React.DOM.input({ type: 'text', placeholder: 'Name', ref: 'accountName', required: true }),
                    React.DOM.br(null),
                    React.DOM.textarea({ placeholder: 'Description...', ref: 'description' }),
                    React.DOM.br(null),
                    React.DOM.input({ type: 'submit', value: 'Add account!', ref: 'submitButton' })
                )
            );
        }
    });
});