'use strict';

define(['database', 'react', 'settings'], function(Database, React, Settings) {

    return React.createClass({
        displayName: 'SettingsLogout',

        getInitialState: function() {
            return { done: false, inProgress: false, error: null };
        },

        onLogout: function() {
            Database.cancel();

            var self = this;
            self.setState({ error: null, inProgress: 'Ensuring all local data is fully exported..' });
            Database.exportTo(Settings.get('database_url'), function(err) {
                if (err) {
                    console.error('Error during final export: ', err);
                    if (self.isMounted())
                        self.setState({ error: err, inProgress: false });
                    return;
                }

                self.setState({ inProgress: 'Removing local data..' });
                Settings.remove('database_url');
                Settings.remove('last_import');
                Settings.remove('last_export');

                Database.destroy(function(err) {
                    if (err) {
                        console.error('Could not destroy database: ', err);
                        if (self.isMounted())
                            self.setState({ error: err, inProgress: false });
                        return;
                    }

                    self.setState({ inProgress: false, done: true });
                });
            });

            return false;
        },

        render: function() {
            if (this.state.done)
                return React.DOM.p(null, 'Great success! You are logged out');

            if (!Settings.get('database_url'))
                return React.DOM.p({className: 'errorText'}, 'Weird, you appear already logged out?');

            return React.DOM.p(null,
                React.DOM.input({ type: 'button', value: 'Logout!', onClick: this.onLogout, disabled: this.state.inProgress }),
                (this.state.inProgress ? React.DOM.p(null, 'Status: ', this.state.inProgress) : null)
            );
        }


    });

});