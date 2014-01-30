'use strict';

define(['database', 'react', 'settings'], function(Database, React, Settings) {

	return React.createClass({
		displayName: 'SettingsAdvanced',

		onSave: function() {
			var federationServer = this.refs.federationServer.getDOMNode().value.trim();
            if (federationServer.length === 0)
                Settings.setFederationServer(undefined);
            else
			    Settings.setFederationServer(federationServer);
			
			var databaseURL = this.refs['databaseURL'].getDOMNode().value.trim();
            if (databaseURL.length === 0)
                databaseURL = undefined;

            if (databaseURL !== Settings.getDatabaseURL()) {
                Settings.setDatabaseURL(databaseURL);
                Database.restartReplication();
                Settings.setLastExport(undefined);
                Settings.setLastImport(undefined);
            }


			return false;
		},


		render: function() {
			return React.DOM.form({ onSubmit: this.onSave },
				React.DOM.h2(null, 'Advanced Settings'),
                React.DOM.table(null,
                    React.DOM.tr(null,
                        React.DOM.td(null, 'Federation Server: '),
                        React.DOM.td(null,
                            React.DOM.input({ ref: 'federationServer', type: 'text', defaultValue: Settings.getFederationServer() })
                        )
                    ),
                    React.DOM.tr(null,
                        React.DOM.td(null, 'Database URL: '),
                        React.DOM.td(null,
                            React.DOM.input({ ref: 'databaseURL', type: 'text', defaultValue: Settings.getDatabaseURL() })
                        )
                    ),
                    React.DOM.tr(null,
                        React.DOM.td(''),
                        React.DOM.td(null,
                            React.DOM.input({ type: 'submit', value: 'Save!' })
                        )
                    )
                ),
                React.DOM.hr(null),
                React.DOM.input({ type: 'button', value: 'Clear all local data!', onClick: this.clear })
			);
		},

        clear: function() {
            Database.destroy(function(err) {
               console.log('Database destroyed!! ', err);
            });
        }
	});

});