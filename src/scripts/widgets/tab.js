'use strict';

define(['react', 'database'], function(React, Database) {

    return React.createClass({
        displayName: 'Account',

        getInitialState: function() {
            return { error: null, isDeleting: false };
        },

        propTypes: {
            object: React.PropTypes.object.isRequired,
            currencies: React.PropTypes.object.isRequired
        },

        render: function() {
            var self = this;
            var currencies = Object.keys(this.props.currencies).map(function(cur) {
                return React.DOM.p({ key: cur }, cur, ': ', self.props.currencies[cur]);
            });


            return React.DOM.div({ className: 'account' },
                React.DOM.h3(null, this.props.object.name),
                (this.state.error ? React.DOM.p({ className: 'errorText' }, this.state.error) : null),
                React.DOM.p(null, this.props.object.description),
                currencies,
                React.DOM.input({type: 'button', value: 'Delete!', disabled: (this.state.isDeleting || this.state.error ), onClick: this.onDelete })
            );
        },

        onDelete: function() {
            console.log('Trying to delete ', this.props.object);
            this.setState({ isDeleting: true });

            var self = this;

            Database.remove(self.props.object, function(err, response) {
                console.log('Removed doc: ', self.props.key, ' with response ', err, ' -- ', response);

                if (self.isMounted()) {
                    if (err) {
                        self.setState({ isDeleting: false, error: err.toString() });
                    }
                }
            });


        }
    });

});
