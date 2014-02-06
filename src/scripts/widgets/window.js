'use strict';

define(['react','pouchdb-nightly',
    'database', 'settings',
	'widgets/contact_list', 'widgets/contact_adder', 'widgets/contact_detail',
	'widgets/record_adder', 'widgets/record_list',
    'widgets/settings_overview', 'widgets/settings_register', 'widgets/settings_advanced', 'widgets/settings_login', 'widgets/settings_logout'
],
    function(React, PouchDB
        , Database, Settings
        , ContactList, ContactAdder, ContactDetail
        , RecordAdder, RecordList
        , SettingsOverview, SettingsRegister, SettingsAdvanced, SettingsLogin, SettingsLogout
        , QueryMixin) {

	function assert(b) {
		if (!b) throw new Error('Assertion Failure!');
	}

	return React.createClass({
		displayName: 'Window',

		getInitialState: function() {

            if (Settings.get('database_url')) {
                var category = 'contacts';
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
				case 'contacts':
					return [['name', 'By Name']
						   ,['add', 'Create a contact']];
				case 'records':
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
				case 'contacts':
					switch(this.state.side) {
						case 'name':
							return ContactList({contactClicked: function(contact) {
								self.setState({ side: 'contact_details', which_contact: contact })
							}});
						case 'add':
							return ContactAdder(null);
						case 'contact_details':
							return ContactDetail({ contact: self.state.which_contact });
					}
					break;
                case 'records':
                    switch (this.state.side) {
                        case 'add':
                            return RecordAdder(null);
                        case 'list':
                            return RecordList(null);
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
						React.DOM.li(this.mkProperty('contacts'), 'Contacts'),
						React.DOM.li(this.mkProperty('records'), 'Records'),
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