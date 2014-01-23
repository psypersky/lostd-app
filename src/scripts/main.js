'use strict';

require(['react', 'widgets/window'], function(React, Window) {

	React.renderComponent(
		Window(null),
		document.body
	);

});
