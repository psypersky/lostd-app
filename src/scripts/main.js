'use strict';

require(['react', 'pouchdb-nightly', 'lodash'], function(React, PouchDB, _) {

	function assert(b) {
		if (!b) throw new Error('Assertion Failure!');
	}


	var db = new PouchDB('lostd');


	var AccountAdder = React.createClass({
		displayName: 'AccountAdder',

		propTypes: {
			onAdded: React.PropTypes.func.isRequired
		},

		getInitialState: function() {
			return { isSubmitting: false, errorMsg: null };
		},

		handleAdd: function() {
			var self = this;
			var name = self.refs.accountName.getDOMNode().value.trim();
			if (!name) {
				this.setState({ errorMsg: 'No account name added!' });
				return false;
			}

			var description = self.refs.description.getDOMNode().value.trim();

			this.setState({ errorMsg: null, isSubmitting: true });

			db.post({
					type: 'account',
					name: name,
					description: description,
					created: _.now()
				}, function (err, response) {

					self.setState({ isSubmitting: false });
					if (err) {
						self.setState({ errorMsg: 'Encountered by error: ' + err});
						return;
					}

					console.log('Added new account: ', name, ' with response ', response);
					self.props.onAdded(response);

				});

			return false;
		},

		render: function() {

			return (
				React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
					React.DOM.h2(null, 'Add account'),
					React.DOM.input({ type: 'text', placeholder: 'Name', ref: 'accountName' }),
					React.DOM.br(null),
					React.DOM.textarea({ placeholder: 'Description...', ref: 'description' }),
					React.DOM.br(null),
					React.DOM.input({ type: 'submit', value: 'Add account!', ref: 'submitButton' })
				)
			);
		}

	});


	var AccountList = React.createClass({
		displayName: 'AccountList',

		getInitialState: function() {
			return { data: [] };
		},

		componentWillMount: function() {
			var self = this;

			function map(doc) {
				if (doc.type === 'account')
					emit(doc._id, doc);
			}

			db.query({ map: map }, function(err, response) {
				self.setState({
					data: response.rows.map(function(x) { return x.value;  })
				});

			});
		},

		render: function() {

			var list = this.state.data.map(function (x) { return React.DOM.p({ key: x._id},  x); });

			return React.DOM.ul(null, list);
		}
	});

	var Window = React.createClass({
		displayName: 'Window',

		getInitialState: function() {
			return { tab: 'accounts', side: 'list' };
		},

		mkProperty: function(tab) {
			var self = this;

			if (this.state.tab === tab)
				return { className: 'active' };
			else 
				return {
					onClick: function() {
						self.setState({ tab: tab });
					}
				};
		},

		options: function(tab) {
			switch (tab) {
				case 'accounts':
					return {
						list: 'List All',
						add: 'Add Account'
					};
				case 'pay':
					return {
						make: 'Make a payment',
						add: 'Add a payment',
					};
				case 'receive':
					return {
						details: 'Details',
						add: 'Received a payment'
					};
			}
		},

		sidebar: function() {

			var opts = this.options(this.state.tab);

			var self = this;

			var items = Object.keys(opts).map(function (key) {

					var property = { key: key, onClick: function() { self.setState({ side: key }); } };

					if (self.state.side === key)
						property.className = 'active';

					return React.DOM.li(property, opts[key]);
				});

			return React.DOM.ul({ id: 'sidebar' }, items);
		},

		widget: function() {
			var self = this;
			switch(this.state.tab) {
				case 'accounts':
					switch(this.state.side) {
						case 'list':
							return AccountList(null);
						case 'add':
							return AccountAdder({ onAdded: function() { self.setState({ side: 'list' });  } });
					}
					break;
			}

			var err = 'Unknown window widget for: ' + this.state.tab + ' and ' + this.state.side;
			console.log(err);
			return React.DOM.p(null, err);
		},

		render: function() {
			var self = this;

			return (
				React.DOM.div({ id: 'total' },
					React.DOM.h1(null, 'Lostd App'),		
					React.DOM.ul({ id: 'tabs' },
						React.DOM.li(this.mkProperty('accounts'), 'Accounts'),
						React.DOM.li(this.mkProperty('pay'), 'Pay'),
						React.DOM.li(this.mkProperty('receive'), 'Receive')
					),
					React.DOM.div({id: 'underTab'},
						this.sidebar(),
						React.DOM.div({ id: 'page' }, this.widget() ),
						React.DOM.br({ id: 'clear' })
					)
				)
			);
		}
	});




	React.renderComponent(
	  Window(null),
	  document.body
	);


});
