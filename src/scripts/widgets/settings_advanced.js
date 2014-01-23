'use strict';

define(['react', 'settings'], function(React, Settings) {

	return React.createClass({ 
		displayName: 'SettingsAdvanced',

		onSave: function() {
			var federationServer = this.refs.federationServer.getDOMNode().value.trim();
			Settings.setFederationServer(federationServer);
			
			var databaseURL = this.refs.databaseURL.getDOMNode().value.trim();
			Settings.setDatabaseURL(databaseURL);

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
                )
			);
		}
	});

});