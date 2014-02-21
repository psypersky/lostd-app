'use strict';

define(['database', 'global', 'react'], function(Database, Global, React) {
    var R = React.DOM;


    return React.createClass({
        displayName: 'DateWidget',

        getInitialState: function() {
            return { done: false, status: null, error: null };
        },

        instantLogout: function() {
            var self = this;

            this.setState({ error: null, status: 'Destroying local database' });

            Global.keys = null;
            delete window.localStorage['password'];
            Database.destroy(function(err) {
                if (err) {
                    console.error('Unable to destroy database: ', err);
                    if (self.isMounted)
                        self.setState({ error: err.toString() });
                    return;
                }

                if (self.isMounted)
                    self.setState({ done: true });
            });

        },

        safeLogout: function() {
            var self = this;
            this.setState({ error: null, status: 'Export all changes' });
            Database.exportSync(function(err) {
                if (err) {
                    console.error('Unable to export database: ', err);
                    if (self.isMounted)
                        self.setState({ error: err.toString() });
                    return;
                }

                self.instantLogout();
            });
        },

        render: function() {
            if (this.state.done)
                return R.p(null, 'Logged out!!');

            return R.div(null,
                (this.state.error ? R.p({ className: 'errorText' }, this.state.error) : null),
                (this.state.status ? R.p(null, this.state.status) : null),
                R.input({ type: 'button', value: 'Instant Logout (without saving)', onClick: this.instantLogout}),
                R.br(null),
                R.input({ type: 'button', value: 'Save and logout', onClick: this.safeLogout })
            );
        }

    });

});
