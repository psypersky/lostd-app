'use strict';

define(['react','pouchdb-nightly',
    'database', 'settings',
    'widgets/tab_list', 'widgets/tab_adder',
    'widgets/debt_adder', 'widgets/debt_list',
    'widgets/settings_overview', 'widgets/settings_register', 'widgets/settings_advanced', 'widgets/settings_login', 'widgets/settings_logout'
],
    function(React, PouchDB
        , Database, Settings
        , TabList, TabAdder
        , DebtAdder, DebtList
        , SettingsOverview, SettingsRegister, SettingsAdvanced, SettingsLogin, SettingsLogout
        , QueryMixin) {

	function assert(b) {
		if (!b) throw new Error('Assertion Failure!');
	}

	return React.createClass({
		displayName: 'Window',

		getInitialState: function() {

            if (Settings.get('database_url')) {
                var category = 'tabs';
                return { loggedIn: true, category: category, side: this.defaultSide(category) };
            } else {
                return { loggedIn: false, category: 'settings', side: 'login' };
            }
		},

        componentWillMount: function() {
            var self = this;
            this.loggedInListener = Settings.listen('database_url', function (dbUrl) {
                self.setState({ loggedIn: !!dbUrl });
            });
        },

        componentWillUnmount: function() {
            this.loggedInListener.cancel();
        },

		defaultSide: function(category) {
			return this.options(category)[0][0];
		},

		mkProperty: function(category) {
			var self = this;

			if (this.state.category === category)
				return { className: 'active' };
			else 
				return {
					onClick: function() {
                        self.setState({ category: category, side: self.defaultSide(category) });
					}
				};
		},

		options: function(category) {
			switch (category) {
				case 'tabs':
					return [['name', 'By Name']
						   ,['add', 'Create a Tab']];
				case 'debt':
					return [['add', 'Add']
						   ,['list', 'List']];
				case 'payment':
					return [['add', 'Add']
						   ,['details', 'Details']];
				case 'settings':
                    var start = (this.state.loggedIn ? [['logout', 'Logout']] : [['login', 'Login'], ['register', 'Register']]);
					return start.concat([['overview', 'Overview'], ['advanced', 'Danger Zone']]);
				default:
					assert('Unknown category: ' + category);
			}
		},

		sidebar: function() {

			var opts = this.options(this.state.category);

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

			return React.DOM.ul(null, items);
		},

		widget: function() {
			var self = this;
			switch(this.state.category) {
				case 'tabs':
					switch(this.state.side) {
						case 'name':
							return TabList(null);
						case 'add':
							return TabAdder(null);
					}
					break;
                case 'debt':
                    switch (this.state.side) {
                        case 'add':
                            return DebtAdder(null);
                        case 'list':
                            return DebtList(null);
                    }
                case 'payment':
                    switch (this.state.side) {
                        case 'add':
                            // ...
                    }
                    break;
				case 'settings':
					switch (this.state.side) {
						case 'login':
							return SettingsLogin(null);
						case 'register':
							return SettingsRegister(null);
                        case 'logout':
                            return SettingsLogout(null);
                        case 'overview':
                            return SettingsOverview(null);
						case 'advanced':
							return SettingsAdvanced(null);
					}
					break;
			}

			var err = 'Unknown window widget for: ' + this.state.category + ' and ' + this.state.side;
			console.log(err);
			return React.DOM.p(null, err);
		},

		render: function() {
			return (
				React.DOM.div(null,
					React.DOM.h1(null, 'Lostd App'),		
					React.DOM.ul({ id: 'categories' },
						React.DOM.li(this.mkProperty('tabs'), 'Tabs'),
						React.DOM.li(this.mkProperty('debt'), 'Debt'),
						React.DOM.li(this.mkProperty('payment'), 'Payment'),
						React.DOM.li(this.mkProperty('settings'), 'Settings')
					),
                    React.DOM.hr(null),
					React.DOM.table(null,
                        React.DOM.tr(null,
                            React.DOM.td({ id: 'sidebar' },
							    this.sidebar()
                            ),
							React.DOM.td({ id: 'page' },
                                this.widget()
                            )
						)
					)
				)
			);
		},

	});
});