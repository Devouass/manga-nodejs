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

var download = function(options, fileName, callback, context) {
	var returnStatus = {
		status: "success",
		error:""
	};

	if(!options || !fileName || !fileName instanceof String){
		console.log('wrong parameters');
		if(callback) {
			returnStatus.status = "error";
			returnStatus.error = "wrong parameters";
			callback.call(context, returnStatus);
		}
	}

	var file = fs.createWriteStream(fileName);
	
	var req = http.get(options, function (res) {
		
		res.pipe(file);
		file.on('finish', function () {
            file.close(function(){}); // close() is async, call callback after close completes.
        });
        file.on('error', function (err) {
            fs.unlink(fileName); // Delete the file async. (But we don't check the result)
            if (callback){
            	returnStatus.status = "error";
				returnStatus.error = err;
				callback.call(context, returnStatus);
            }
        });
	    /*res.on('data', function(data) {
	  	});*/
	 	res.on('end', function() {
	 		if(callback){
	 			callback.call(context, returnStatus);
	 		}
	  	});
	}).on('error', function (e) {
		console.log('error ' + e.message);
		if(callback){
			callback.call(context, returnStatus);
		}
	});
}

var getManga = function(tomInit, tomEnd, callback) {
	console.log('start : '+tomInit+' end : '+tomEnd);
	var path = _getPath(769,1);

	console.log('path is '+path);

	var options = {
		host : hostManga,
		port : 80,
		path : path
	};

	var c = function(result) {
		result.manga = {};
		if(this.tom){
			result.manga.tom = this.tom;
		}
		if(this.page){
			result.manga.page = this.page;
		}
		if(this.callback){
			this.callback(result);
		}
	}
	download(options, 'test.jpeg', c, {tom: '769', page:'1', callback:callback});
}

var fileWriter = {};
fileWriter.getManga = getManga;

module.exports = fileWriter;