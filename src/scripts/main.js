
require(['react', 'pouchdb-nightly'], function(React, PouchDB) {

	var db = new PouchDB('lostd');

	db.allDocs({include_docs: true}, function(err, response) {

		console.log('Response: ', response);


	});


	var Frame = React.createClass({
		displayName: 'Frame',

		getInitialState: function() {
			return { view: 'people' };
		},


		render: function() {

			var self = this;

			function mkProperty(t) {

				console.log('view: ', self.state.view);

				return self.state.view === t ? {
					id: 'activeFrameHeader'
				} : {
					onClick: function() {
						self.setState({ view: t });
					}
				};
			}


			return (
				React.DOM.div({ id: 'frame' },
					React.DOM.div({ id: 'header ' },
						React.DOM.div(mkProperty('people'), 'People'),
						React.DOM.div(mkProperty('my_debts'), 'My Debts'),
						React.DOM.div(mkProperty('owes_me'), 'Owes me')
					)
				)
			);

		}
	});

	React.renderComponent(
	  Frame(null),
	  document.getElementById('content')
	);


});
