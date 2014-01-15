var assert = require('assert');
var crypto = require('crypto');
var exec = require('child_process').exec;
var fs = require('fs');


var enableGzip = true;

function gzip(filename, callback) {
	if (enableGzip)
		execute('gzip --best ' + filename + ' && mv ' + filename + '.gz ' + filename, callback);
	else
		callback(null);
}


function execute(command, callback) {
    exec(command, function(err, stdout, stderr){
    	console.log('exec result: ', err, stdout, stderr);
    	assert(!err);
    	if (stderr) console.error(stderr);

    	callback(null, stdout);
    });
};

function hash(filename) {
	var shasum = crypto.createHash('sha1');

	shasum.update(fs.readFileSync(filename));

	return shasum.digest('hex');
}

var cssHash = hash('./build/style.css').substring(0, 8);
var jsHash =  hash('./build/main.js').substring(0, 8);

console.log('Hash of js', cssHash, ' and of js ', jsHash);



var contents = fs.readFileSync('./build/index.html', { encoding: 'UTF-8' });


// compress css

execute('rm -rf ./build/scripts', function() {
	console.log('..removed old scripts');
});


gzip('./build/style.css', function(err) {
	assert(!err);

	execute('mv ./build/style.css ./build/' + cssHash + '.css', function() {
		console.log('style.css done..');
	});
});

gzip('./build/main.js', function(err) {
	assert(!err);

	execute('mv ./build/main.js ./build/' + jsHash + '.js', function() {
		console.log('main.js done..');
	});
});

var result = contents
	.replace(/\>\s+\</g, '><')
	.replace('<link rel="stylesheet" type="text/css" href="style.css" />', '<link rel="stylesheet" type="text/css" href="' + cssHash + '.css" />')
	.replace('<script data-main="scripts/main" src="scripts/require.js" /></script>', '<script type="text/javascript" src="' + jsHash + '.js" ></script>');


fs.writeFileSync('./build/index.html', result);
