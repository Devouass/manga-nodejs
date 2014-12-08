var fs = require('fs');

var sendError = function(response){
	response.writeHead(404, {"Content-Type": "text/html"});
    response.end('Not found');
}

var getFile = function(path, response) {
	var filesPath = __dirname +'/..' + path;
	if(!fs.existsSync(filesPath)){
		sendError(response);
	}
	fs.readFile(filesPath, 'utf-8', function(error, content) {
        response.writeHead(200, {"Content-Type": "application/javascript"});
        response.end(content);
    });
}



var filesLoader = {};
filesLoader.getFile = getFile;

module.exports = filesLoader;