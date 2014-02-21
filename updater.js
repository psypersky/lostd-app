var assert = require('assert');
var crypto = require('crypto');
var exec = require('child_process').exec;
var fs = require('fs');


var enableGzip = true;
var deploy = true;

function gzip(filename) {
	if (enableGzip)
		execute('gzip --best ' + filename + ' && mv ' + filename + '.gz ' + filename);
}

var todo = [];

function execute(command) {
    todo.push(command);

    if (todo.length === 1)
        run();

    function run() {

        var command = todo[0];
        exec(command, function(err, stdout, stderr) {
            console.log('exec result (' + command + ') ', err, stdout, stderr);
            assert(!err);
            if (stderr) console.error(stderr);

            todo.shift();
            if (todo.length > 0)
                run();
        });
    }

}

function hash(filename) {
	var shasum = crypto.createHash('sha1');
	shasum.update(fs.readFileSync(filename));
	return shasum.digest('hex');
}

var jsHash = hash('./build/main.js').substring(0, 8);
var styleHash = hash('./build/style.css').substring(0,8);

console.log('Hash of js: ', jsHash);
console.log('Style hash: ', styleHash);

var contents = fs.readFileSync('./build/index.html', { encoding: 'UTF-8' });

execute('rm -rf ./build/scripts');

execute('mv ./build/main.js ./build/' + jsHash + '.js');

execute('mv ./build/style.css ./build/' + styleHash + '.js');

// simple replace, no escaping bullshit
function sreplace(str, find, replace) {
	var arr = str.split(find);
	assert(arr.length === 2);
	return arr[0] + replace + arr[1];
}

contents = contents.replace(/\>\s+\</g, '><');
contents = contents.replace('style.css', styleHash + '.css');
contents = sreplace(contents, '<script data-main="scripts/main" src="scripts/require.js"></script>', '<script type="text/javascript" src="' + jsHash + '.js"></script>');
contents = contents.replace(/\s+/g, ' ');

fs.writeFileSync('./build/index.html', contents);

// Gzip everything!

function gzipEverything(dir) {
    var files = fs.readdirSync(dir);
    console.log('Files: ', files);

    files.forEach(function (f) {
        var file = dir + '/' + f;

        var stats = fs.statSync(file);

        if (stats.isFile())
            gzip(file, function(err) {
                assert(!err);
            });
        else if (stats.isDirectory()) {
            // Wait a second, before going down a directory..
            setTimeout(
                gzipEverything,
                2000,
                file
            );
        }
    });
}

setTimeout(
    gzipEverything,
    1000,
    './build'
);


if (deploy) {
    setTimeout(function() {

    console.log('Starting upload...');

    execute('aws s3 sync --region us-west-1 --content-encoding gzip --cache-control max-age=31536000 build/ s3://get.lostd.com/');
	//execute('aws s3 cp --region us-west-1 --content-encoding gzip --content-type "text/javascript; charset=utf-8" --cache-control max-age=31536000 build/' + jsHash + '.js s3://get.lostd.com/' + jsHash + '.js')
    //execute('aws s3 cp --region us-west-1 --content-encoding gzip --content-type "text/html; charset=utf-8" build/index.html  s3://get.lostd.com/index.html');

    }, 5000); // delay, hopefully finished gzipping by then lol
}