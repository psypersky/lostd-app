
require(['react', 'pouchdb-nightly'], function(React, PouchDB) {

	var db = new PouchDB('lostd');



	var Hello = React.createClass({
	  render: function() {
	    return (
	      React.DOM.div({
	        className: 'hello',
	        children: 'Hello world! I am React!'
	      })
	    );
	  }
	});

	Hello.renderComponent(
	  CommentBox({}),
	  document.getElementById('content')
	);



});
