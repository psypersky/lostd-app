'use strict';

define(['react', 'database', 'widgets/account_dropdown'], function(React, Database, AccountDropDown) {

    return React.createClass({
        displayName: 'AmountAdder',

        propTypes: {
            which: React.PropTypes.string.isRequired // 'debt' or 'receive'
        },

        getInitialState: function() {
            return { done: false, isSubmitting: false, error: null };
        },

        handleAdd: function() {
            var self = this;

            // ...

            return false;
        },

        render: function() {
            if (this.state.done)
                return React.DOM.p(null, 'Amount Added!');

            var word = this.props.which === 'debt' ? 'Debt' : 'Payment';

            var dropDown = null;

            return (
                 React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
                    React.DOM.h2(null, 'Add ', word),
                    (this.state.msg ? React.DOM.p(null, this.state.msg) : null),
                    React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Account:'),
                            React.DOM.td(null, AccountDropDown(null))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Amount:'),
                            React.DOM.td(null, React.DOM.input({ type: 'number', step: 'any' }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Currency:'),
                            React.DOM.td(null, React.DOM.input({ type: 'text' }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, 'Description:'),
                            React.DOM.td(null, React.DOM.textarea({ placeholder: 'Description...', ref: 'description' }))
                        ),
                        React.DOM.tr(null,
                            React.DOM.td(null, ''),
                            React.DOM.td(null, React.DOM.input({ type: 'submit', value: 'Add account!', ref: 'submitButton' }))
                        )
                    )
                 )
            );
        }
    });
});