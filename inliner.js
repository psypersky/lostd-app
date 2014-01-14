var assert = require('assert');
var fs = require('fs');

var js = fs.readFileSync(__dirname + '/main-built.js', { encoding: 'UTF-8' });
var contents = fs.readFileSync(__dirname + '/src/index.html', { encoding: 'UTF-8' });

contents = contents.replace(/\s+/g, ' ');

var split = contents.split('<script src="script/require.js"></script>');
assert(split.length === 2);

var total = split[0] + '<script type="text/javascript">' + js + '</script>' + split[1];

fs.writeFileSync('./build/index.html', total);

