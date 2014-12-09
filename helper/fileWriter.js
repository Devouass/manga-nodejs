var fs = require('fs'),
	http = require('http');

var hostManga = 'www.lelscan.biz',
	pathInit = '/mangas/one-piece/',
	JPG = '.jpg';

//http://lelscan.biz/mangas/one-piece/769/00.jpg
var _getPath = function(tom, number) {
	var n = number;
	if(n < 10){
		n = '0' +n;
	}
	return pathInit + tom + '/' + n + JPG;
}

var getManga = function(callback) {
	var path = _getPath(769,1);

	var t = function(message) {
		console.log(message);
	}

	console.log('path is '+path);

	var options = {
		host : hostManga,
		port : 80,
		path : path
	};

	var file = fs.createWriteStream('test.jpg');

	var req = http.get(options, function (res) {

		var img = '';
		res.pipe(file);
		file.on('finish', function () {
            file.close(t); // close() is async, call callback after close completes.
        });
        file.on('error', function (err) {
            fs.unlink('test.jpg'); // Delete the file async. (But we don't check the result)
            if (t)
                t(err.message);
        });

	    res.on('data', function(data) {
	    	console.log('receiving data');
	    	img += data;
	  	});
	 	res.on('end', function() {
	 		console.log('finish');
	 		callback();
	  	});
	}).on('error', function (e) {
		console.log(e.message);
	});
	req.setTimeout(12000, function () {
		console.log("time out");
        request.abort();
    });


    /*function download(url, dest, callback) {
	    var file = fs.createWriteStream(dest);
	    var request = http.get(url, function (response) {
	        response.pipe(file);
	        file.on('finish', function () {
	            file.close(callback); // close() is async, call callback after close completes.
	        });
	        file.on('error', function (err) {
	            fs.unlink(dest); // Delete the file async. (But we don't check the result)
	            if (callback)
	                callback(err.message);
	        });
	    });
	}*/
}



var fileWriter = {};
fileWriter.getManga = getManga;

module.exports = fileWriter;