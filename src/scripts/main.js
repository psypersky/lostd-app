'use strict';

require(['react', 'widgets/window', 'lodash'], function(React, Window, PouchDB, _) {


	React.renderComponent(
		Window(null),
		document.body
	);


});
