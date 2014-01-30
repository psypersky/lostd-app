'use strict';

define(['react', 'database'], function(React, Database) {

    return React.createClass({
        displayName: 'Account',

        getInitialState: function() {
            return { error: null, isDeleting: false };
        },

        propTypes: {
            key: React.PropTypes.string.isRequired,
            rev: React.PropTypes.string.isRequired,
            name: React.PropTypes.string.isRequired,
            description: React.PropTypes.string
        },

        render: function() {
            return React.DOM.div({ className: 'account' },
                React.DOM.h3(null, this.props.name),
                (this.state.err ? React.DOM.p(null, this.state.err) : null),
                React.DOM.p(null, this.props.description),
                React.DOM.input({type: 'button', value: 'Delete!', disabled: (this.state.isDeleting || this.state.error ), onClick: this.onDelete })
            );
        },

        onDelete: function() {
            console.log('Trying to delete ', this.props.key);
            this.setState({ isDeleting: true });

            var self = this;

            Database.remove({ _id: this.props.key, _rev: this.props.rev }, function(err, response) {
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
