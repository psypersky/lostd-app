'use strict';

define(['react', 'widgets/currency_list'], function(React, CurrencyList){

    return React.createClass({

        displayName: 'Settings',

        propTypes: {
            changeWindowWidget: React.PropTypes.func.isRequired,
            setTopButton: React.PropTypes.func.isRequired
        },

        changeWindowWidget: function() {
            this.props.changeWindowWidget(CurrencyList())
        },

        setTopButton: function() {
            var btn = R.section({className: 'right-small tab-bar-button'}, R.p(null, 'TODO:'));
            this.props.setTopButton(btn);
        },

        render: function() {
            var R = React.DOM;
            return (
                R.div({className:'row'},
                    R.div({className: 'large-12 columns'},
                        R.ul(null,
                            R.label(null, 'General'),
                            R.li(null, 
                                R.a({href: '#', onClick: this.changeWindowWidget }, 'Currencies')
                            )
                        )
                    )
                )
            );
        }

    });
});