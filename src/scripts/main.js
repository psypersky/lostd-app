'use strict';

require(['react', 'pouchdb-nightly', 'lodash'], function(React, PouchDB, _) {

	function assert(b) {
		if (!b) throw new Error('Assertion Failure!');
	}


	var db = new PouchDB('lostd');

	var FriendView = React.createClass({
		displayName: 'FriendView',

		getInitialState: function() {
			return { data: [] };
		},

		componentWillMount: function() {
			var self = this;

			function map(doc) {
				if (doc.type === 'friend')
					emit(doc._id, doc);
			}

			db.query({ map: map }, function(err, response) {
				self.setState({
					data: response.rows.map(function(x) { return x.value;  })
				});

			});
		},

		render: function() {

			var list = this.state.data.map(function (x) {  return React.DOM.li({ key: x._id }, 'Friend ', JSON.stringify(x)); });

			return React.DOM.ul(null, list);
		}
	});


	var Frame = React.createClass({
		displayName: 'Frame',

		render: function() {
			var self = this;

			assert(typeof self.props.view === 'string');
			assert(typeof self.props.onStateChanged === 'function');

			function mkProperty(v) {
				return self.props.view === v ? {
					id: 'activeFrameHeader'
				} : {
					onClick: function() {
						self.props.onStateChanged(v);
					}
				};
			}

			return (
				React.DOM.div({ id: 'frame' },
					React.DOM.ul({ id: 'header ' },
						React.DOM.li(mkProperty('friends'), 'Friends'),
						React.DOM.li(mkProperty('my_debts'), 'My Debts'),
						React.DOM.li(mkProperty('owes_me'), 'Owes me')
					),
					this.props.view === 'friends' ? FriendView(null) : null
				)
			);
		}
	});

	var FriendAdder = React.createClass({
		displayName: 'FriendAdder',

		handleAdd: function() {
			var self = this;
			var name = self.refs.friendName.getDOMNode().value.trim();
			if (!name)
				return false;



			// Import to disable it, to stop double-submitting..
			self.refs.submitButton.getDOMNode().disabled = true;


			db.post({
				type: 'friend',
				name: name,
				added: _.now()
			}, function (err) {
				if (err)
					console.error('Unable to add friend: ', name, ' got error: ', err);
				else
					self.props.onDone(true);
			});

			return false;
		},

		render: function() {
			return (
				React.DOM.form({ id: 'adder', onSubmit: this.handleAdd },
					React.DOM.h2(null, 'Add friend'),
					React.DOM.input({ type: 'text', placeholder: 'Name', ref: 'friendName' }),
					React.DOM.br(null),
					React.DOM.input({ type: 'submit', value: 'Add friend!', ref: 'submitButton' })
				)
			);
		}

	});

	var Window = React.createClass({
		displayName: 'Window',

		getInitialState: function() {
			return {
				isAdding: false,
				frameView: 'friends'
			};
		},

		toggleState: function() {
			this.setState({ isAdding: !this.state.isAdding });
		},

		setViewState: function(view) {
			this.setState({ frameView: view });
		},
		
		render: function() {

			var button;
			if (this.state.isAdding)
				button = React.DOM.input({ type: 'button', onClick: this.toggleState, value: 'Cancel' });
			else {
				switch (this.state.frameView) {
					case 'friends':
						button = React.DOM.input({ type: 'button', onClick: this.toggleState, value: 'Add a friend' });
						break;
					case 'my_debts':
						button = null;
						break;
					case 'owes_me':
						button = null;
						break;
					default:
						assert(false);
				}
			}

			var widget;
			if (this.state.isAdding) {
				switch (this.state.frameView) {
					case 'friends':
						widget = FriendAdder({ onDone: this.toggleState });
						break;
					default:
						widget = null;
				}
				
			} else {
				widget = Frame({ view: this.state.frameView, onStateChanged: this.setViewState });
			}

			return (
				React.DOM.div(null,
					React.DOM.h1(null, 'Lostd App'),
					button,
					widget
				)
			);
		}

	});

	React.renderComponent(
	  Window(null),
	  document.body
	);


});
