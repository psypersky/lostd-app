'use strict';

define(['react', 'database', 'accounting'], function(React, Database, Accounting) {

    return React.createClass({
        displayName: 'SettingsCurrency',

        getInitialState: function() {
            return {
                symbol: '$',
                decimal: '.',
                thousand: ',',
                precision: 2,
                format: '%s%v',
                name: ''
            }
        },

        createCurrency: function() {
            var self = this;
            return function() {
                var options = {
                            symbol: self.state.symbol,
                            decimal: self.state.decimal,
                            thousand: self.state.thousand,
                            precision: self.state.precision,
                            format: self.state.format
                    };
                Database.addCurrency(self.state.name, options, function(){
                    self.setState({created: true});
                });

                return false;
            }
        },

        handleChanges: function() {
            var self = this;
            return function(id) {
                console.log(id.getDOMNode());

            }
        },

        setStateHandler: function(what, to) {
            var self = this;
            return function() {
                var op = {};
                op[what] = to;
                self.setState(op)
            }
        },

        setStateChangeHandler: function(what) {
            var self = this;
            return function(event) {
                var op = {};
                op[what] = event.target.value;
                self.setState(op)
            }
        },

        render: function() {
            var R = React.DOM;
            if(this.state.created)
                return R.p(null, 'Currency created');

            var formatedNumber = Accounting.formatMoney(1000.00, this.state);
            
            return(
                R.form({className: 'ca-container', onSubmit: this.createCurrency()}, 
                    R.div({ className: 'row' },
                        R.div({ className: 'large-12 columns'},
                            R.div(null, formatedNumber),
                            R.br(null)
                        )
                    ),
                    R.div({ className: 'row'},
                        R.div({className: 'large-12 columns'},
                            R.label(null, 'Currency Name'),
                            R.input({ type: 'text', required: true, placeholder: 'Currency Name', onChange: this.setStateChangeHandler('name') })
                        )
                    ),
                    R.div({ className: 'row' },
                        R.div({ className: 'large-12 columns'},
                            R.label( null, 'Thousands Separator:  '),
                            R.input({ type: 'radio', name: 'thousands-separator', value: 'comma', onChange: this.setStateHandler('thousand',','), defaultChecked: true }),
                            R.label( null, ','),
                            R.input({ type: 'radio', name: 'thousands-separator', value: 'dot', onChange: this.setStateHandler('thousand','.') }),
                            R.label( null, '.'),
                            R.input({ type: 'radio', name: 'thousands-separator', value: 'space', onChange: this.setStateHandler('thousand',' ') }),
                            R.label( null, 'space'),
                            R.input({ type: 'radio', name: 'thousands-separator', value: 'empty', onChange: this.setStateHandler('thousand','') }),
                            R.label( null, 'empty')
                        )
                    ),
                    R.div({ className: 'row' },
                        R.div({ className: 'large-12 columns'}, 
                            R.label(null, 'Decimal Separator'),
                            R.input({ type: 'radio', name: 'decimal-separator', value: '.', onChange: this.setStateHandler('decimal','.'), defaultChecked: true }),
                            R.label( null, '.'),
                            R.input({ type: 'radio', name: 'decimal-separator', value: ',', onChange: this.setStateHandler('decimal',',') }),
                            R.label( null, ','),
                            R.input({ type: 'radio', name: 'decimal-separator', value: 'space', onChange: this.setStateHandler('decimal', ' ') }),
                            R.label( null, 'space')
                        )
                    ),
                    R.div({ className: 'row' },
                        R.div({ className: 'large-12 columns'},
                            R.label(null, 'Decimal Count'),
                            R.input({ type: 'number', step: 'any', min: 0, max: 15, required: true, value: this.state.precision, onChange: this.setStateChangeHandler('precision') })
                        )
                    ),
                    R.div({ className: 'row' },
                        R.div({ className: 'large-12 columns'},
                            R.label(null, 'Currency Symbol'),
                            R.input({ type: 'text', value: this.state.symbol, onChange: this.setStateChangeHandler('symbol')})
                        )
                    ),
                    R.div({ className: 'row' },
                        R.div({ className: 'large-12 columns'},
                            R.span(null, 'Format'),
                            R.input({ type: 'radio', name:'format', value: '0 S', onChange: this.setStateHandler('format', '%v %s') } ),
                            R.label(null, '0 S'),
                            R.input({ type: 'radio', name:'format', value: '0S', onChange: this.setStateHandler('format', '%v%s') } ),
                            R.label(null, '0S'),
                            R.input({ type: 'radio', name:'format', value: 'S 0', onChange: this.setStateHandler('format', '%s %v') } ),
                            R.label(null, 'S 0'),
                            R.input({ type: 'radio', name:'format', value: 'S0', onChange: this.setStateHandler('format', '%s%v'), defaultChecked: true } ),
                            R.label(null, 'S0')
                        )
                    ),
                    R.div({ className: 'row' },
                        R.div({ className: 'large-12 columns'},
                            R.input({type: 'submit', className: 'button', value: 'Create Currency'} )
                        )
                    )
                )
            );
        }

    });

});