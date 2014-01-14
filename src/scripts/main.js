'use strict';

require(['react', 'pouchdb-nightly', 'lodash'], function(React, PouchDB, _) {

	function assert(b) {
		if (!b) throw new Error('Assertion Failure!');
	}


	var db = new PouchDB('lostd');

	console.log('current time:', _.now())


	db.allDocs({include_docs: true}, function(err, response) {

		console.log('Response: ', response);


	});


	var PeopleView = React.createClass({
		displayName: 'PeopleView',

		getInitialState: function() {
			return { data: [] };
		},

		componentWillMount: function() {
			var self = this;

			db.allDocs({include_docs: true}, function(err, response) {
				self.setState({
					data: response.rows.map(function(x) { return x.doc; })
				});

			});
		},

		render: function() {

			var list = this.state.data.map(function (x) {  return React.DOM.li({ key: x._id }, 'Person ', JSON.stringify(x));  });

			return (
				React.DOM.ul(null,
					list
				)
			);

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
						React.DOM.li(mkProperty('people'), 'People'),
						React.DOM.li(mkProperty('my_debts'), 'My Debts'),
						React.DOM.li(mkProperty('owes_me'), 'Owes me')
					),
					this.props.view === 'people' ? PeopleView(null) : null
				)
			);
		}
	});

	var Adder = React.createClass({
		displayName: 'Adder',

		render: function() {
			return (
				React.DOM.form(null,
					React.DOM.select(null,
						React.DOM.option(null, 'Person'),
						React.DOM.option(null, 'My debt'),
						React.DOM.option(null, 'Owes me')
					)
				)
			);
		}

	});

	var Window = React.createClass({
		displayName: 'Window',

		getInitialState: function() {
			return {
				isAdding: false,
				frameView: 'people'
			};
		},

		toggleState: function() {
			this.setState({ isAdding: !this.state.isAdding });
		},

		setViewState: function(view) {
			this.setState({ frameView: view });
		},
		
		render: function() {
			return (
				React.DOM.div(null,
					React.DOM.h1(null, 'Lostd App'),
					React.DOM.a({ onClick: this.toggleState }, this.state.isAdding ? 'Cancel' : 'Add'),
					(this.state.isAdding ? Adder(null) : Frame({ view: this.state.frameView, onStateChanged: this.setViewState }))
				)
			);
		}

	});

	React.renderComponent(
	  Window(null),
	  document.body
	);


});
