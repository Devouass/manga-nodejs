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

var fakeDownload = true;

var download = function(options, fileName, context) {

	var sockMessage = {
		status : "",
		manga : {
			name : context.name || "One Piece",
			page: context.page,
			chapter: context.chapter
		}
	}

	if(fakeDownload){
		if(context.page == "00"){
			sockMessage.status = "newManga";
			eventEmitter.emit("message", sockMessage)
		}
 		if(context.page == "15" && (context.end == context.chapter || context.end == "theLast")){
 			console.log("download finish");
 			context.downloadFinishCallback("success");
 		} else if (context.page == "15") {
 			var nextChapter = parseInt(context.chapter);
 			nextChapter++;
 			context.chapter =  nextChapter + "";
 			context.page = "00";
 			sockMessage.status = "finished"
 			eventEmitter.emit("message", sockMessage)
 			eventEmitter.emit("continue", context);
 		} else {
 			setTimeout(function(){
 				console.log("next page")
 				var nextPage = parseInt(context.page);
 				nextPage++;
 				context.page =  nextPage + "";
 				eventEmitter.emit("continue", context);
 			}, 100);
 		}
 		return;
	}


	if(!options || !fileName || !fileName instanceof String){
		console.log('wrong parameters');
		context.downloadFinishCallback("error")
	}

	var file = fs.createWriteStream(fileName);
	console.log('download '+options.path);
	
	var req = http.get(options, function (res) {
		
		if(res.statusCode === 404){

			if(context.page == "00"){
				console.log("download finish, no more chapter to download");
	 			context.downloadFinishCallback("success");
			} else if(context.end != "theLast" && context.end == context.chapter){
	 			console.log("download finish, chapter "+context.end+" downloaded");
	 			context.downloadFinishCallback("success");
	 		} else {
	 			console.log("file not found");
				fs.unlinkSync(fileName);
				console.log("next chapter");
	 			var nextChapter = parseInt(context.chapter);
	 			nextChapter++;
	 			context.chapter =  nextChapter + "";
	 			context.page = "0";
	 			sockMessage.status = "finished"
	 			eventEmitter.emit("message", sockMessage)
	 			eventEmitter.emit("continue", context);
	 		}
		} else {
			res.pipe(file);
			file.on('finish', function () {
	            file.close(function(){}); // close() is async, call callback after close completes.
	        });
	        file.on('error', function (err) {
	            fs.unlinkSync(fileName); // Delete the file async. (But we don't check the result)
	            console.log('error on files' + err);
				context.downloadFinishCallback("error");
	        });
		}

		res.on('close', function() {
			console.log("res close")
		})

		
	    /*res.on('data', function(data) {
	  	});*/
	 	res.on('end', function() {
	 		//never called when 404 received...
	 		sockMessage.status = "success"
 			eventEmitter.emit("message", sockMessage)
 			console.log("next page")
 			var nextPage = parseInt(context.page);
 			nextPage++;
 			context.page =  nextPage + "";
 			eventEmitter.emit("continue", context);
	  	});
	}).on('error', function (e) {
		console.log('request error' + e.message);
		context.downloadFinishCallback("error");
	});

	req.setTimeout(20000, function() {
		console.log("time out on socket");
		req.end();
		console.log('waiting 30s before continue');
		sockMessage.status = "pending";
		eventEmitter.emit("message", sockMessage);
		setTimeout(function(){
			console.log("let's try again");
			eventEmitter.emit("continue", context);
		}, 30000);
	})
}

var INITdir = "./downloads/OnePiece/";
var getDirectory = function(chapter){
	if(fakeDownload){
		return INITdir + chapter + "/";
	}
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

	var privateCallback = function(result) {

		//retrieve good number for page
		var n = parseInt(result.page);
		if(n < 10){
			n = '0' +n;
		}
		result.page = n + "";

		var url = getURL(result.chapter, result.page);
		result.options.path = url + "";
		var dirPath = getDirectory(result.chapter);
		var imagePath = dirPath + result.page + '.jpg';
		download(result.options, imagePath, result);
	};

	eventEmitter.on('continue', privateCallback);

	eventEmitter.on('new_chapter', function(param){
		broadcast(param);
	});

	eventEmitter.on('message', function(param){
		broadcast(param);
	})

	var endCallback = function(status){
		if(status == "error"){
			console.log('end download with error');
			eventEmitter.emit("message", {status: "error"})

		} else if (status == "success"){
			console.log('end download with success');
			eventEmitter.emit("message", {status: "download finish"})
		} else {
			console.log("end download with unknown status : "+status);
		}
		console.log('removing all listeners')
		eventEmitter.removeAllListeners('continue');
		eventEmitter.removeAllListeners('message');
		console.log("all listeners removed");
	}

	//then launch for the first time
	var param = {
		chapter : start,
		page: "0",
		options: options,
		end: end,
		downloadFinishCallback: endCallback
	};
	privateCallback(param);
	
}

var fileWriter = {};
fileWriter.getManga = getManga;

module.exports = fileWriter;