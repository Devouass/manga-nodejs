var fs = require('fs'),
	http = require('http');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var fakeDownload = false;

var download = function(options, fileName, context) {
	var firstPage = context.firstPage;
	var sockMessage = {
		status : "",
		manga : {
			name : context.manga,
			page: context.page,
			chapter: context.chapter
		}
	}

	if(fakeDownload){
		if(context.page == firstPage){
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
 			context.page = firstPage;
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

	var file = fs.createWriteStream(fileName);
	console.log('download '+options.path);

	var req = http.get(options, function (res) {
		
		if(res.statusCode === 404){
			fs.unlinkSync(fileName);
			if(context.page == firstPage){
				console.log("download finish, no more chapter to download");
	 			context.downloadFinishCallback("success");
			} else if(context.end != "theLast" && context.end == context.chapter && context.doublePage){
	 			console.log("download finish, chapter "+context.end+" downloaded");
	 			context.downloadFinishCallback("success");
	 		} else {
	 			console.log("file not found");
	 			if(context.doublePage){
	 				context.doublePage="";
	 				var nextChapter = parseInt(context.chapter);
		 			nextChapter++;
		 			context.chapter =  nextChapter + "";
		 			context.page = firstPage;
		 			sockMessage.status = "finished"
		 			eventEmitter.emit("message", sockMessage)
		 			eventEmitter.emit("continue", context);
	 			} else {
	 				var nextPage = parseInt(context.page);
 					nextPage++;
 					nextPage = nextPage < 10 ? '0' + nextPage : nextPage + "";
 					context.doublePage = context.page+'-'+ nextPage;
	 				context.page = nextPage;
	 				eventEmitter.emit("continue", context);
	 			}
	 		}
		} else {
			if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
				fs.unlinkSync(fileName);
				if(context.page == firstPage){
					console.log("download finish, no more chapter to download");
		 			context.downloadFinishCallback("success");
				} else if(context.end != "theLast" && context.end == context.chapter){
		 			console.log("download finish, chapter "+context.end+" downloaded");
		 			context.downloadFinishCallback("success");
		 		} else {
		 			console.log("file not found");
		 			var nextChapter = parseInt(context.chapter);
		 			nextChapter++;
		 			context.chapter =  nextChapter + "";
		 			context.page = firstPage;
		 			sockMessage.status = "finished"
		 			eventEmitter.emit("message", sockMessage)
		 			eventEmitter.emit("continue", context);
		 		}
			} else {
				if(context.page == firstPage){
					sockMessage.status = "newManga";
					eventEmitter.emit("message", sockMessage)
				}

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
		}

		res.on('close', function() {
			console.log("res close")
		})

		
	    /*res.on('data', function(data) {
	  	});*/
	 	res.on('end', function() {
	 		//never called when 404 received...
	 		//sockMessage.status = "success"
 			//eventEmitter.emit("message", sockMessage)
 			var nextPage = parseInt(context.page);
 			context.doublePage = "";
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

var getURL = function(manga, tom, number, doublePage) {
	var pathInit = '/mangas/'
	if(manga === 'fairytail'){
		pathInit = "/images/tests/";
	} else if(manga == 'My%20Hero%20Academia' || manga == "My Hero Academia") {
		pathInit = "/lecture-en-ligne/";
	} else if(manga == "fairytail_ovh") {
		pathInit ="/data/manga/Fairy/";
	}

	if(manga != "fairytail_ovh") {
		pathInit = pathInit + manga;
	}
	
	var n;
	if(doublePage) {
		n = doublePage;
	} else {
		n = parseInt(number);

		var toto = true;
		//toto = false;

		if(toto && n < 10){
			n = '0' +n;
		}
	}
	return pathInit + '/' + tom + '/' + n + '.jpg';
}

var INITdir = "";
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
		console.log("repertory created");
	}
	var path = INITdir + chapter;
	if(!fs.existsSync(path)){
		console.log("repertory " + chapter + " created");
		fs.mkdirSync(path, 0755);
	}
	return path + '/';
}

var getManga = function(mangaInfos, broadcast) {
	console.log('try to download '+ mangaInfos.manga.id+' from chapter '+mangaInfos.first+' to '+mangaInfos.last);

	//set init dir in function of the manga id...
	INITdir = "./downloads/" + mangaInfos.manga.id +'/';
	var options = {
		host : mangaInfos.manga.site,
		port : 80
	};

	var privateCallback = function(result) {
		var n;
		if(result.doublePage){
			n = result.doublePage;
		} else {
			//retrieve good number for page
			n = parseInt(result.page);
			if(n < 10){
				n = '0' +n;
			}
			result.page = n + "";
		}
		
		var url = getURL(result.manga, result.chapter, result.page, result.doublePage);
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

	var firstPage = (mangaInfos.manga.id === "fairytail" || mangaInfos.manga.id === "My%20Hero%20Academia") ? "01" : "00";
	//var firstPage = mangaInfos.manga.id === "My%20Hero%20Academia" ? "01" : "00";
	//firstPage = mangaInfos.manga.id === "naruto" ? "3" : firstPage;
	//firstPage = "02";

	//then launch for the first time
	var param = {
		manga: mangaInfos.manga.id,
		chapter : mangaInfos.first,
		firstPage: firstPage,
		doublePage: "",
		page: firstPage,
		options: options,
		end: mangaInfos.last,
		downloadFinishCallback: endCallback
	};
	privateCallback(param);
	
}

var fileWriter = {};
fileWriter.getManga = getManga;

module.exports = fileWriter;
