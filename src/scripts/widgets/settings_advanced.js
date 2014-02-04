'use strict';

define(['database', 'react', 'settings'], function(Database, React, Settings) {

	return React.createClass({
		displayName: 'SettingsAdvanced',

		onSave: function() {
			var federationServer = this.refs.federationServer.getDOMNode().value.trim();
            if (federationServer.length === 0)
                Settings.remove('federation_server');
            else
			    Settings.set('federation_server', federationServer);
			
			var databaseURL = this.refs['databaseURL'].getDOMNode().value.trim();
            if (databaseURL.length === 0)
                Settings.remove('database_url');
            else
                Settings.set('database_url', databaseURL);

			return false;
		},



		render: function() {
            var federationServer = Settings.get('federation_server');
            if (!federationServer)
                federationServer = 'http://federation.lostd.com';

			return React.DOM.form({ onSubmit: this.onSave },
				React.DOM.h2(null, 'Advanced Settings'),
                React.DOM.table(null,
                    React.DOM.tr(null,
                        React.DOM.td(null, 'Federation Server: '),
                        React.DOM.td(null,
                            React.DOM.input({ ref: 'federationServer', type: 'text', defaultValue: federationServer })
                        )
                    ),
                    React.DOM.tr(null,
                        React.DOM.td(null, 'Database URL: '),
                        React.DOM.td(null,
                            React.DOM.input({ ref: 'databaseURL', type: 'text', defaultValue: Settings.get('database_url') })
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
                React.DOM.input({ type: 'button', value: 'Clear all local data!', onClick: this.clear }),
                React.DOM.br(null),
                React.DOM.input({ type: 'button', value: 'Delete all data, local and remote!', onClick: this.deleteAll })
			);
		},

        clear: function() {
            Database.destroy(function(err) {
               console.log('Database destroyed!! ', err);
            });
        },

        deleteAll: function() {
            Database.deleteAll(function(err, count) {
                console.log('All documents deleted ', err, count);
            })
        }
	});

});