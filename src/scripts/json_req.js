define(function() {


	// Send a JSON request (verb) to TO, with data (an object, of key-values). Callback is called when done with (err, response);
	function send(verb, to, data, callback) {

		function mkLogger(prefix) {
			return function() {
				console.log(prefix, Array.prototype.slice.call(arguments).join(', '));
			}
		}

		// Lets URL encode data
		var params = Object.keys(data).map(function(key) {
			return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
		}).join('&');

		var req = new XMLHttpRequest();


		req.onerror = function() {
			console.error('Request to ', to, ' got error ', this);
			return callback(new Error('Unable to make request'));
		};

		req.onload = function() {
			if (this.status >= 200 && this.status <= 299) { // 2xx is success
				callback(null, this.response);
			} else {
				callback(this.response ? this.response : new Error('Request Error'));
			}
		}

		console.log('Sending request to: ', to);
		req.open('POST', to);
        req.responseType = 'json';
		req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		req.setRequestHeader('Accept', 'application/json');
		req.send(params);
	}

	return {
		post: function(to, data, callback) { send('POST', to, data, callback); }
	};

});