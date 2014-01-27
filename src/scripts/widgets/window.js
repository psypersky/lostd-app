'use strict';

define(['react','pouchdb-nightly'
    ,'database', 'settings'
    , 'widgets/account_list', 'widgets/account_adder'
    , 'widgets/settings_overview', 'widgets/settings_register', 'widgets/settings_advanced', 'widgets/settings_login'],
    function(React, PouchDB
        , Database, Settings
        , AccountList, AccountAdder
        , SettingsOverview, SettingsRegister, SettingsAdvanced, SettingsLogin) {

	function assert(b) {
		if (!b) throw new Error('Assertion Failure!');
	}

	return React.createClass({
		displayName: 'Window',

		getInitialState: function() {
			var tab = 'accounts';
			return { tab: tab, side: this.defaultSide(tab) };
		},

		defaultSide: function(tab) {
			return this.options(tab)[0][0];
		},

		mkProperty: function(tab) {
			var self = this;

			if (this.state.tab === tab)
				return { className: 'active' };
			else 
				return {
					onClick: function() {
                        self.setState({ tab: tab, side: self.defaultSide(tab) });
					}
				};
		},

		options: function(tab) {
			switch (tab) {
				case 'accounts':
					return [['name', 'By Name']
						   ,['add', 'Add Account']];
				case 'pay':
					return [['make', 'Make a payment']
						   ,['add', 'Add a payment']];
				case 'receive':
					return [['details', 'Details']
						   ,['add', 'Add received payment']];
				case 'settings':
					return [['overview', 'Overview']
						   ,['login', 'Login']
						   ,['register', 'Create account']
						   ,['advanced', 'Danger Zone']];
				default:
					assert('Unknown tab: ' + tab);
			}
		},

		sidebar: function() {

			var opts = this.options(this.state.tab);

			var self = this;

			var items = opts.map(function (kv) {
					var key = kv[0];
					var value = kv[1];

					var property = { key: key, onClick: function() { self.setState({ side: key }); } };

					if (self.state.side === key) {
						property.className = 'active';
					}

					return React.DOM.li(property, value);
				});

			return React.DOM.ul({ id: 'sidebar' }, items);
		},

		widget: function() {
			var self = this;
			switch(this.state.tab) {
				case 'accounts':
					switch(this.state.side) {
						case 'name':
							return AccountList(null);
						case 'add':
							return AccountAdder(null);
					}
					break;
				case 'settings':
					switch (this.state.side) {
						case 'overview':
							return SettingsOverview({ sync: Database.sync });
						case 'login':
							return SettingsLogin({ onLogin: function() {
                                console.log('Succesfully logged in!');
                            }});
						case 'register':
							return SettingsRegister(null);
						case 'advanced':
							return SettingsAdvanced(null);
					}
					break;
			}

			var err = 'Unknown window widget for: ' + this.state.tab + ' and ' + this.state.side;
			console.log(err);
			return React.DOM.p(null, err);
		},

		render: function() {
			return (
				React.DOM.div(null,
					React.DOM.h1(null, 'Lostd App'),		
					React.DOM.ul({ id: 'tabs' },
						React.DOM.li(this.mkProperty('accounts'), 'Accounts'),
						React.DOM.li(this.mkProperty('pay'), 'Pay'),
						React.DOM.li(this.mkProperty('receive'), 'Receive'),
						React.DOM.li(this.mkProperty('settings'), 'Settings')
					),
					React.DOM.table({id: 'underTab'},
                        React.DOM.tr(null,
                            React.DOM.td(null,
							    this.sidebar()
                            ),
							React.DOM.td({ id: 'page' },
                                this.widget()
                            )
						)
					)
				)
			);
		}
	});
});