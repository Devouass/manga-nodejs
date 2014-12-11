var fs = require('fs'),
	http = require('http');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var hostManga = 'www.lelscan.biz',
	pathInit = '/mangas/one-piece/',
	JPG = '.jpg';

//http://lelscan.biz/mangas/one-piece/769/00.jpg
var getURL = function(tom, number) {
	var n = parseInt(number);
	if(n < 10){
		n = '0' +n;
	}
	return pathInit + tom + '/' + n + JPG;
}

var download = function(options, fileName, context) {

	var sockMessage = {
		status : "",
		page: context.page,
		chapter: context.chapter
	}

	if(true){
		sockMessage.status = "success"
		eventEmitter.emit("message", sockMessage)
 		if(context.page == "03"){
 			console.log("download finish");
 			context.callback.call({status: "success", message: "download success"});
 		} else {
 			setTimeout(function(){
 				console.log("next page")
 				var nextPage = parseInt(context.page);
 				nextPage++;
 				context.page =  nextPage + "";
 				eventEmitter.emit("continue", context);
 			}, 3000);
 		}
 		return;
	}


	if(!options || !fileName || !fileName instanceof String){
		console.log('wrong parameters');
		context.callback.call({status: "error", message: "invalidParameters"});
	}

	var file = fs.createWriteStream(fileName);
	console.log('download '+options.path);
	
	var req = http.get(options, function (res) {
		
		if(res.statusCode === 404){
			console.log("file not found");
			fs.unlinkSync(fileName);
			console.log("next chapter");
 			var nextChapter = parseInt(context.chapter);
 			nextChapter++;
 			context.chapter =  nextChapter + "";
 			sockMessage.status = "not found"
 			eventEmitter.emit("message", sockMessage)
 			eventEmitter.emit("continue", context);
		} else {
			res.pipe(file);
			file.on('finish', function () {
	            file.close(function(){}); // close() is async, call callback after close completes.
	        });
	        file.on('error', function (err) {
	            fs.unlinkSync(fileName); // Delete the file async. (But we don't check the result)
	            console.log('error on files');
				context.callback.call({status: "error", message: err});
	        });
		}

		
	    /*res.on('data', function(data) {
	  	});*/
	 	res.on('end', function() {
	 		sockMessage.status = "success"
 			eventEmitter.emit("message", sockMessage)
	 		if(context.page == "03"){
	 			console.log("download finish");
	 			context.callback.call({status: "success", message: "download success"});
	 		} else {
	 			console.log("next page")
	 			var nextPage = parseInt(context.page);
	 			nextPage++;
	 			context.page =  nextPage + "";
	 			eventEmitter.emit("continue", context);
	 		}
	  	});
	}).on('error', function (e) {
		console.log('request error' + e.message);
		context.callback.call({status: "error", message: e.message});
	});

	req.setTimeout(20000, function() {
		console.log("time out on socket");
		req.end();
		console.log('waiting 30s before continue');
		sockMessage.status = "pending";
		eventEmitter.emit("message", context.sockMessage);
		setTimeout(function(){
			console.log("let's try again");
			eventEmitter.emit("continue", context);
		}, 30000);
	})
}

var INITdir = "./downloads/OnePiece/";
var getDirectory = function(chapter){
	if(!fs.existsSync(INITdir)){
		if(!fs.existsSync("./downloads")){
			console.log("create initial directory");
			fs.mkdirSync("./downloads", 0755);
		}
		console.log("repertory downloads created");
		fs.mkdirSync(INITdir, 0755);
		console.log("repertory OnePiece created");
	}
	var path = INITdir + chapter;
	if(!fs.existsSync(path)){
		console.log("repertory " + chapter + " created");
		fs.mkdirSync(path, 0755);
	}
	return path + '/';
}

var getManga = function(start, end, broadcast) {
	console.log('try to download One Piece from chapter '+start+' to '+end);

	var options = {
		host : hostManga,
		port : 80
	};

	var sockCallBack = broadcast;

	var privateCallback = function(result) {

		//retrieve good number for page
		var n = parseInt(result.page);
		if(n < 10){
			n = '0' +n;
		}
		result.page = n;

		var url = getURL(result.chapter, result.page);
		result.options.path = url + "";
		var dirPath = getDirectory(result.chapter);
		var imagePath = dirPath + result.page + '.jpg';
		download(result.options, imagePath, result);
	};

	eventEmitter.on('continue', privateCallback);

	eventEmitter.on('message', function(param){
		console.log("sending sock message");
		sockCallBack(param);
	})

	var endCallback = function(){
		console.log('end download with status '+this.status);
		eventEmitter.removeAllListeners('continue');
		eventEmitter.removeAllListeners('message');
		console.log("all listener removed");
	}

	//then launch for the first time
	var param = {
		chapter : start,
		page: "0",
		options: options,
		end: end,
		callback: endCallback
	};
	privateCallback(param);
	
}

var fileWriter = {};
fileWriter.getManga = getManga;

module.exports = fileWriter;