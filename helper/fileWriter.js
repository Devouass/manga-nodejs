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

var download = function(options, fileName, callback) {
	if(!options || !fileName || !fileName instanceof String){
		callback({});
	}

	var file = fs.createWriteStream(fileName);
	var returnStatus = {
		status: "success",
		error:"",
		manga : {
			chapter: "",
			img: ""
		}
	};

	var req = http.get(options, function (res) {
		
		res.pipe(file);
		file.on('finish', function () {
            file.close(t); // close() is async, call callback after close completes.
        });
        file.on('error', function (err) {
            fs.unlink(fileName); // Delete the file async. (But we don't check the result)
            if (t)
                t(err.message);
        });
	    res.on('data', function(data) {
	  	});
	 	res.on('end', function() {
	 		callback();
	  	});
	}).on('error', function (e) {
		console.log('error ' + e.message);
		callback()
	});
}

var getManga = function(callback) {
	var path = _getPath(769,1);

	console.log('path is '+path);

	var options = {
		host : hostManga,
		port : 80,
		path : path
	};



	
	/*req.setTimeout(12000, function () {
		console.log("time out");
		var t = (new Date()).getTime() - initTime;
		console.log("time out thrown in " + t)
        req.abort();
        callback();
    });*/


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