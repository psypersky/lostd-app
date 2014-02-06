var assert = require('assert');
var crypto = require('crypto');
var exec = require('child_process').exec;
var fs = require('fs');


var enableGzip = true;
var deploy = true;

function gzip(filename, callback) {
	if (enableGzip)
		execute('gzip --best ' + filename + ' && mv ' + filename + '.gz ' + filename, callback);
	else
		callback(null);
}


function execute(command, callback) {
    exec(command, function(err, stdout, stderr){
    	console.log('exec result (' + command + ') ', err, stdout, stderr);
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

var jsHash =  hash('./build/main.js').substring(0, 8);

console.log('Hash of js: ', jsHash);

var contents = fs.readFileSync('./build/index.html', { encoding: 'UTF-8' });
var css = fs.readFileSync('./build/style.css');

execute('rm -rf ./build/scripts', function() {
	console.log('..removed old scripts');
});

gzip('./build/main.js', function(err) {
	assert(!err);

	execute('mv ./build/main.js ./build/' + jsHash + '.js', function() {
		console.log('main.js done..');
	});
});

// simple replace, no escaping bullshit
function sreplace(str, find, replace) {
	var arr = str.split(find);
	assert(arr.length === 2);
	return arr[0] + replace + arr[1];
}

contents = contents.replace(/\>\s+\</g, '><');
contents = sreplace(contents, '<link rel="stylesheet" type="text/css" href="style.css" />', '<style type="text/css">' + css + '</style>');
contents = sreplace(contents, '<script data-main="scripts/main" src="scripts/require.js"></script>', '<script type="text/javascript" src="' + jsHash + '.js"></script>');
contents = contents.replace(/\s+/g, ' ');

fs.writeFileSync('./build/index.html', contents);

gzip('./build/index.html', function(err) {
	assert(!err);
	console.log('Finished index.html...');
});

if (deploy) {
	execute('aws s3 cp --content-encoding gzip --content-type "text/javascript; charset=utf-8" --cache-control max-age=31536000 build/' + jsHash + '.js s3://app.lostd.com/' + jsHash + '.js', function() {
		console.log('Synced javascript...');
		execute('aws s3 cp --content-encoding gzip --content-type "text/html; charset=utf-8" build/index.html  s3://app.lostd.com/index.html', function() {
			console.log('Synced index.html.. ');
		});
	});
}