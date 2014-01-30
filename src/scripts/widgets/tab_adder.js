'use strict';

define(['react', 'database'], function(React, Database) {

    return React.createClass({
        displayName: 'TabAdder',

        getInitialState: function() {
            return { done: false, isSubmitting: false, error: null };
        },

        handleAdd: function() {
            var self = this;
            var name = self.refs['tabName'].getDOMNode().value.trim();
            if (!name) {
                this.setState({ error: 'No name for tab!' });
                return false;
            }

            var description = self.refs.description.getDOMNode().value.trim();

            this.setState({ error: null, isSubmitting: true });

            Database.addTab(name, description, function (err, response) {
                if (!self.isMounted()) return;

                if (err) {
                    self.setState({ isSubmitting: false, error: 'Encounted error: ' + err.toString()});
                } else {
                    console.log('Added new tab: ', name, ' with response ', response);
                    self.setState({ isSubmitting: false, done: true });
                }
            });

            return false;
        },

        render: function() {
            if (this.state.done)
                return React.DOM.p(null, 'Tab Added!');

            return (
                React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add Tab'),
                    (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                    React.DOM.input({ type: 'text', placeholder: 'Name', ref: 'tabName', required: true }),
                    React.DOM.br(null),
                    React.DOM.textarea({ placeholder: 'Description...', ref: 'description' }),
                    React.DOM.br(null),
                    React.DOM.input({ type: 'submit', value: 'Add tab!', ref: 'submitButton' })
                )
            );
        }
    });
});