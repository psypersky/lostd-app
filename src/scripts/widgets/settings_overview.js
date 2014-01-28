'use strict';

define(['react', 'database', 'settings'], function(React, Database, Settings) {

    return React.createClass({
        displayName: 'SettingsOverview',

        getInitialState: function() {
            return { syncing: false, log: [], lastImport: Settings.getLastImport(), lastExport: Settings.getLastExport() };
        },

        importListener: undefined,
        exportListener: undefined,


        componentWillMount: function() {
            var self = this;
            this.importListener = Settings.listenLastImport(function (lastImport) {
                self.setState({ lastImport: lastImport });
            });

            this.exportListener = Settings.listenLastExport(function (lastExport) {
                self.setState({ lastExport: lastExport });
            });
        },

        componentWillUnmount: function() {
            this.importListener.cancel();
            this.exportListener.cancel();
        },

        sync: function() {
            var self = this;
            function onImportComplete(err) {
                if (self.isMounted()) {
                    if (err)
                        self.setState({ log: self.state.log.concat('Import failed with error: ', err) });
                    else
                        self.setState({ log: self.state.log.concat('Import succeed!') });
                }
            }
            function onExportComplete(err) {
                if (self.isMounted()) {
                    if (err)
                        self.setState({ log: self.state.log.concat('Export failed with error: ', err) });
                    else
                        self.setState({ log: self.state.log.concat('Export succeed!') });
                }
            }
            function onComplete() {
                if (self.isMounted()) {
                    self.setState({ syncing: false });
                }
            }

            self.setState({ log: [], syncing: true });
            Database.sync(onImportComplete, onExportComplete, onComplete);
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
                this.state.log.join(' | ')
            );
        }
    });

});