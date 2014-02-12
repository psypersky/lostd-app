'use strict';

define(['assert', 'react', 'database', 'widgets/query_mixin'], function(assert, React, Database, QueryMixin) {

    var mixin = QueryMixin(function(doc, emit) {
        if (doc.type === 'contact' && doc._id === this.props.contact._id) {
            emit('contact', doc);
        } else if (doc.type === 'record' && doc.contact === this.props.contact._id) {
            emit('record', doc);
        }
    });

    return React.createClass({
        displayName: 'ContactDetail',

        mixins: [mixin],

        propTypes: {
            contact: React.PropTypes.object.isRequired
        },

        getInitialState: function() {
            return { editing: null, showingCurrency: null };
        },

        handleUpdate: function(what) {
            var self = this;

            return function() {
                self.props.contact[what] = self.refs[what].getDOMNode().value.trim();
                Database.updateContact(self.props.contact, function (err, response) {
                    if (self.isMounted())
                        self.setState({ editing: null });

                    if (err)
                        return console.error('Caught error updating contact: ', err);

                    self.props.contact._rev = response.rev;
                });
                return false;
            }
        },

        handleCurrency: function(currency) {
            var toSet = (currency === this.state.showingCurrency) ? null : currency;
            this.setState({ showingCurrency: toSet });
        },

        stopPropagation: function(event) {
            event.stopPropagation();
        },

        setEditing: function(what) {
            var self = this;
            return function(event) {
                self.setState({ editing: what });
                event.stopPropagation();
            }
        },

        clearEditing: function() {
            this.setState({ editing: null });
        },

        render: function() {
            var self = this;

            /* Save all the records in an Array using currency as a key */
            var contact = {};
            var currencyRecords = {};   //Currency - Records[]
            if (!this.state.ready) {
                contact = this.props.contact;
            } else {
                this.forEachKV(function(key, value) {
                    if (key === 'contact')
                        contact = value;
                    else {
                        assert(key === 'record')
                        if (value.currency in currencyRecords ) {
                            currencyRecords[value.currency].push(value);
                        } else {
                            currencyRecords[value.currency] = [value];  // Currency - Records[]
                        }
                    }
                });
            }

            /*  Iterate through the currencyRecords and get the sum, total transactions, received transactions and send transactions */
            var currenciesTotals = {};
            for (var currency in currencyRecords) {
                currenciesTotals[currency] = {
                    total: 0,
                    transactions: 0,
                    sent: 0,
                    received: 0
                };
                for (var record in currencyRecords[currency]) {
                    currenciesTotals[currency].total += currencyRecords[currency][record].amount;
                }
            }

            /* Name field */
            var name; 
            if(this.state.editing === 'name') {
                name = React.DOM.form({ onClick: this.stopPropagation, onSubmit: this.handleUpdate('name') },
                    React.DOM.input({ autoFocus: true, type: 'text', placeholder: 'Name', ref: 'name', required: true, defaultValue: contact.name}),
                    React.DOM.input({ type: 'submit', value: 'Save!', className: 'name' })
                );
            } else {
                name = React.DOM.h3({ onClick: this.setEditing('name') }, contact.name);
            }

            /* Description Field */
            var description;
            if (this.state.editing === 'description' || !this.props.contact.description) {
                description = React.DOM.form({ onClick: this.stopPropagation, onSubmit: this.handleUpdate('description')},
                    React.DOM.h3(null, 'Description:'),
                    React.DOM.textarea({ autoFocus: (this.state.editing === 'description'), placeholder: 'Description', ref: 'description', className: 'description', defaultValue: contact.description }),
                    React.DOM.input({ type: 'submit', value: 'Save!', className: 'description' })
                );
            } else {
                description = React.DOM.div({ onClick: this.setEditing('description') },
                    React.DOM.h3({ className: 'description' }, 'Description: '),
                    React.DOM.p({ ref: 'description', className: 'description'},
                    (this.props.contact.description.length === 0) ? 'Insert Description' : contact.description)
                );
            }

            var lostdAddress;
            if (this.state.editing === 'lostd_address' || !contact.lostd_address) {
                lostdAddress = React.DOM.form({ onClick: this.stopPropagation, onSubmit: this.handleUpdate('lostd_address') },
                    'Lostd Address: ',
                    React.DOM.input({ type: 'email', autoFocus: (this.state.editing === 'lostd_address'), placeholder: 'Lostd Address', ref: 'lostd_address', defaultValue: contact.lostd_address }),
                    React.DOM.input({ type: 'submit', value: 'Save!' })
                );
            } else {
                lostdAddress = React.DOM.div({ onClick: this.setEditing('lostd_address') },
                    React.DOM.p(null, 'Lostd Address: ', contact.lostd_address)
                );
            }

            var publicKey;
            if(this.state.editing === 'public_key' || !contact.public_key) {
                publicKey = React.DOM.form({ onClick: this.stopPropagation, onSubmit: this.handleUpdate('public_key') },
                    'Public Key: ',
                    React.DOM.input({ type: 'text', autoFocus: (this.state.editing === 'public_key'), placeholder: 'Public Key', ref: 'public_key', defaultValue: contact.public_key, pattern: "^[a-zA-Z0-9\-_]+$" }),
                    React.DOM.input({ type: 'submit', value: 'Save!' })
                );
            } else {
                publicKey = React.DOM.div({ onClick: this.setEditing('public_key') },
                    React.DOM.p(null, 'Public Key: ', contact.public_key)
                );
            }


            /* Create the row of each currency */
            var currencyRows = [];

            Object.keys(currenciesTotals).forEach(function(currency) {

                currencyRows.push(React.DOM.tr({
                            key: 'row_' + currency,
                            className: 'currency_row', onClick: function() {
                            self.handleCurrency(currency);
                        }}, 
                        React.DOM.td(null, React.DOM.b(null, "Currency: "), currency),
                        React.DOM.td(null , React.DOM.b(null, "Total: "), currenciesTotals[currency].total)
                    ));

                if (currency === self.state.showingCurrency) {
                    if (self.state.showingCurrency) {

                        var rows = Object.keys(currencyRecords[self.state.showingCurrency]).map(function(transaction) {
                            return React.DOM.tr({ key: 'transaction_' + transaction },
                                React.DOM.td(null, 'Qty: ', currencyRecords[self.state.showingCurrency][transaction].amount),
                                React.DOM.td(null, 'Type: ',  currencyRecords[self.state.showingCurrency][transaction].record_type),
                                React.DOM.td(null, 'Date: ', new Date(currencyRecords[self.state.showingCurrency][transaction].created).toString()),
                                React.DOM.td(null, 'Description: ', currencyRecords[self.state.showingCurrency][transaction].description)
                            );
                        });
                    }

                    currencyRows.push(React.DOM.table({ key: 'currencyDetails', className: 'currency_details' }, rows));
                }
            });


            return React.DOM.div({ onClick: this.clearEditing },
                        React.DOM.div({className: 'contact_details' },
                            name,
                            React.DOM.br(null),
                            description,
                            React.DOM.br(null),
                            lostdAddress,
                            React.DOM.br(null),
                            publicKey
                        ),
                        React.DOM.div(null,
                            React.DOM.table({className: 'currencies_table'}, currencyRows)
                        )
                    );
        }
    });
});
 