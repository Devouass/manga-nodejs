var fs = require('fs');

var sendError = function(response){
	response.writeHead(404, {"Content-Type": "text/html"});
    response.end('Not found');
}

var getContentType = function(path){
	var contentType = "text/html";
	if(path.indexOf("js") != -1){
		contentType = "application/javascript"
	}
	if(path.indexOf("css") != -1) {
		contentType = "text/css"
	}
	if(path.indexOf("png") != -1){
		contentType = 'image/png';
	}
	if(path.indexOf("gif") != -1){
		contentType = "image/gif";
	}
	if(path.indexOf(".tff") != -1){
		contentType = "application/octet-stream";
	}
	return contentType;
}

var getFile = function(path, response) {
	var filesPath = __dirname +'/..' + path;

	var contentType = getContentType(path);

	if(!fs.existsSync(filesPath)){
		sendError(response);
	}
	var content;
	try {
		content = fs.readFileSync(filesPath);
	} catch(e) {
		sendError(response);
	}

	response.writeHead(200, {'Content-Type': contentType});
	response.end(content);
}



var filesLoader = {};
filesLoader.getFile = getFile;

module.exports = filesLoader;