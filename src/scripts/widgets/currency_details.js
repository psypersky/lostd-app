'use strict';

define(['react', 'database', 'widgets/query_mixin'], function(React, Database, QueryMixin) {

    var mixin = QueryMixin(function(doc, emit) {
        if (doc.type === 'contact') {
            emit('contact', doc);
        }
        if (doc.type === 'record' && doc.contact === this.props.contact._id) {
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
                    if (err) return console.error('Caught error updating contact: ', err);

                    if (self.isMounted())
                        self.setState({ editing: null });
                    self.props.contact._rev = response.rev;
                });
                return false;
            }
        },

        handleClicks: function(e) {
            var className = e.target.className;
            var classPrefix = className.substring(0, 4);

            if(classPrefix == "curr") {
                var ClassCurrency = className.split('_')[1];
                if( ClassCurrency == this.state.showingCurrency) {
                    this.setState({showingCurrency: null})
                } else {
                    this.setState({showingCurrency: ClassCurrency})
                }
            } else if(this.state.showingCurrency != null) {
                this.setState({showingCurrency: null});
            }

            switch(className){
            case 'description':
                    this.setState({ editing: 'description' });
                    break;
                case 'name':
                    this.setState({ editing: 'name' });
                    break;
                default:
                    this.setState({ editing: null });
            }
        },

        render: function() {

            /* Save all the records in an Array using currency as a key */
            var contact = {};
            var records = {};   //Currency - Records[]
            if (!this.state.ready) {
                contact.name = this.props.contact.name;
                contact.description = this.props.description;
            } else {
                this.forEachKV(function(key, value){
                    if(key === 'record') {
                        if( value.currency in records )
                        {
                            records[value.currency].push(value);
                        } else {
                            records[value.currency] = Array();  // Currency - Records[]
                            records[value.currency].push(value);
                        }
                    }
                    if(key === 'contact') {
                            contact.name = value.name;
                            contact.description = value.description;
                    }
                });
            }

            /*  Iterate through the records and get the sum, total transactions, received transactions and send transactions */
            var currenciesTotals = [];
            for (var currency in records) {
                currenciesTotals[currency] = [];
                currenciesTotals[currency]['total'] = 0;
                currenciesTotals[currency]['transactions'] = 0;
                currenciesTotals[currency]['sent'] = 0;
                currenciesTotals[currency]['received'] = 0;
                for(var record in records[currency]) {
                    currenciesTotals[currency]['total'] += records[currency][record].amount;
                    //if(records[currency[record]. )
                }
            }

            /* Name field */
            var name; 
            if(this.state.editing === 'name') {
                name = React.DOM.form({ id: 'name', onSubmit: this.handleUpdate('name')},
                    React.DOM.input({ autoFocus: true, type: 'text', placeholder: 'Name', ref: 'name', className: 'name', required: true, defaultValue: contact.name}),
                    React.DOM.input({ type: 'submit', value: 'Save!', className: 'name' })
                );
            } else {
                name = React.DOM.div(null, 
                    React.DOM.h3({ ref: 'name', className: 'name'}, contact.name)
                );
            }

            /* Description Field */
            var description;
            if(this.state.editing === 'description' || this.props.contact.description.trim().length === 0) {
                description = React.DOM.form({ id: 'description', onSubmit: this.handleUpdate('description')},
                    React.DOM.h3({ className: 'description' }, 'Description:'),
                    React.DOM.textarea({ autoFocus: true, placeholder: 'Description', ref: 'description', className: 'description', defaultValue: contact.description}),
                    React.DOM.input({ type: 'submit', value: 'Save!', className: 'description' })
                );
            } else {
                description = React.DOM.div(null, 
                    React.DOM.h3({ className: 'description' }, 'Description: '),
                    React.DOM.p({ ref: 'description', className: 'description'}, (this.props.contact.description.length<1)?'Insert Description':contact.description)
                );
            }

            /* Create the table for the currency details */
            if(this.state.showingCurrency) {
                var currency_details_rows = [];
                var currency_details_tds = [];
                for (var transaction in records[this.state.showingCurrency]) {
                    currency_details_tds.push(
                        React.DOM.td(null, 'Qty: '),
                        React.DOM.td(null, records[this.state.showingCurrency][transaction].amount),
                        React.DOM.td(null, 'Type: '),
                        React.DOM.td(null, records[this.state.showingCurrency][transaction].record_type),
                        React.DOM.td(null, 'Date: '),
                        React.DOM.td(null, new Date(records[this.state.showingCurrency][transaction].created).toString()),
                        React.DOM.td(null, 'Description: '),
                        React.DOM.td(null, records[this.state.showingCurrency][transaction].description)
                    );
                    console.log(typeof records[this.state.showingCurrency][transaction].created);
                    currency_details_rows.push(
                        React.DOM.tr(null, currency_details_tds)
                    );
                    currency_details_tds = [];
                }
            }

            /* Create the row of each currency */
            var currency_rows = [];
            for (var currency in currenciesTotals) {
               currency_rows.push(
                    React.DOM.tr({className: 'currency_row' ,onClick: this.handleClicks}, 
                        React.DOM.td(null, React.DOM.b({className: "curr_"+currency}, "Currency: "),  currency),
                        React.DOM.td({className: "curr_"+currency} , React.DOM.b(null, "Total: "),   currenciesTotals[currency].total)
                    )
                );
               if(currency === this.state.showingCurrency) {
                    currency_rows.push(
                        React.DOM.table({className: 'currency_details'}, 
                            currency_details_rows
                        )
                    );
                }
            }

            return React.DOM.div(null, 
                        React.DOM.div({className: 'contact_details', onClick: this.handleClicks},
                            name,
                            React.DOM.br(null),
                            description,
                            React.DOM.br(null)
                        ),
                        React.DOM.div(null,
                            React.DOM.table({className: 'currencies_table'}, currency_rows)
                        )
                    );
        }
    });
});
 