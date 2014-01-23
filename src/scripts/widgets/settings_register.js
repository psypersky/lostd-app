'use strict';

define(['react', 'settings', 'json_req'], function(React, Settings, JsonReq) {

	return React.createClass({
		displayName: 'SettingsRegister',

		getInitialState: function() {
			return { error: null, inProgress: false };
		},

		render: function() {
			return (
				React.DOM.form({ onSubmit: this.onRegister },
					React.DOM.h2(null, 'Register!'),
					(this.state.error ? React.DOM.p(null, this.state.error) : null),

					React.DOM.table(null,
						React.DOM.tr(null,
							React.DOM.td(null, 'Username:'),
							React.DOM.td(null, React.DOM.input({ ref: 'username', type: 'text', placeholder: 'username', defaultValue: 'test' }))
						),
						React.DOM.tr(null,
							React.DOM.td(null, 'Password:'),
							React.DOM.td(null, React.DOM.input({ ref: 'password', type: 'password', placeholder: 'password', defaultValue: 'test' }))
						),
						React.DOM.tr(null,
							React.DOM.td(null, 'Confirm Password:'),
							React.DOM.td(null, React.DOM.input({ ref: 'confirm', type: 'password', placeholder: 'password', defaultValue: 'test' }))
						),
						React.DOM.tr(null,
							React.DOM.td(null, 'Email:'),
							React.DOM.td(null, React.DOM.input({ ref: 'email', type: 'text', placeholder: 'email', defaultValue: 'test@test.com' }))
						),
						React.DOM.tr(null,
								React.DOM.td(null, ''),
							React.DOM.td(null, React.DOM.input({ disabled: this.state.inProgress, type: 'submit', defaultValue: 'Register!' }))
						)
					)
				)
			)
		},


		onRegister: function() {
			var username = this.refs.username.getDOMNode().value.trim();

			if (username.length === 0) {
				this.setState({ error: 'Please enter a username' });
				return false;
			} else if (username.length < 4) {
				this.setState({ error: 'Username is too short. Please use at least 4 characters' });
				return false;
			} else if (username.indexOf('@') !== -1) {
				this.setState({ error: 'The @ symbol is invalid in a username'});
				return false;
			}

			var password = this.refs.password.getDOMNode().value;
			var confirm = this.refs.confirm.getDOMNode().value;

			if (password.length === 0) {
				this.setState({ error: 'Please enter a password' });
				return false;
			}

			if (password !== confirm) {
				this.setState({ error: 'Password and confirm password do not match' });
				return false;
			}

			var email = this.refs.email.getDOMNode().value.trim();
			if (email.length < 4) {
				this.setState({ error: 'Email must be at least 4 characters' });
				return false;
			} else if (email.indexOf('@') === -1) {
				this.setState({ error: 'Email is invalid' });
				return false;
			}

			this.setState({ error: null, inProgress: true });

			var to = Settings.getFederationServer() + '/api/create_user';

			var self = this;

			JsonReq.post(to, { username: username, password: password, email: email }, function(err, response) {
				self.setState({ error: err ? err.toString() : null, inProgress: false });

				if (!err) {
					Settings.setDatabaseURL(response.database_url);
				}

			});

			return false;
		}
	});
});