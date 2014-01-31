'use strict';

define(['react', 'database', 'settings'], function(React, Database, Settings) {

    return React.createClass({
        displayName: 'SettingsOverview',

        getInitialState: function() {
            return { syncing: false, error: null, success: false, lastImport: Settings.get('last_import'), lastExport: Settings.get('last_export') };
        },

        importListener: undefined,
        exportListener: undefined,


        componentWillMount: function() {
            var self = this;
            this.importListener = Settings.listen('last_import', function (lastImport) {
                self.setState({ lastImport: lastImport });
            });

            this.exportListener = Settings.listen('last_export', function (lastExport) {
                self.setState({ lastExport: lastExport });
            });
        },

        componentWillUnmount: function() {
            this.importListener.cancel();
            this.exportListener.cancel();
        },

        sync: function() {
            var self = this;

            self.setState({ error: null, syncing: true, success: false });

            Database.sync(Settings.get('database_url'), function(err) {
                if (err) {
                    console.error('Got error during sync: ', err);
                    if (self.isMounted())
                        self.setState({ syncing: false, error: 'Unable to sync! Got error: ' + err});
                    return;
                }

                if (self.isMounted())
                    self.setState({ syncing: false, success: true });
            });
        },

        render: function() {

            var button;

            if (this.state.syncing) {
                button = React.DOM.input({ type: 'button', value: 'Syncing...', disabled: true});
            } else {
                button = React.DOM.input({ type: 'button', value: 'Sync!', onClick: this.sync });
            }

            return React.DOM.div(null,
                React.DOM.p(null, 'Last Import: ' + this.state.lastImport),
                React.DOM.p(null, 'Last Export: ' + this.state.lastExport),
                button,
                (this.state.done ? 'Sync successful!' : null),
                (this.state.error ? React.DOM.p({className: 'errorText'}, 'Got error: ', this.state.error) : null)
            );
        }
    });

});