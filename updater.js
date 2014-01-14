var assert = require('assert');
var fs = require('fs');

var contents = fs.readFileSync('./build/index.html', { encoding: 'UTF-8' });

var result = contents
	.replace(/\>\s+\</g, '><')
	.replace('<script data-main="scripts/main" src="scripts/require.js" /></script>', '<script src="main.js" type="text/javascript"></script>');


fs.writeFileSync('./build/index.html', result);
