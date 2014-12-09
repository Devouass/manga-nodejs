var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    route = require('./helper/routes'),
    filesLoader = require('./helper/filesLoader'),
    server;

var PORT = 8090;

function _get(request, response){
    var path = url.parse(request.url).pathname + "";
    if(path == '/') {
        fs.readFile('./index.html', 'utf-8', function(error, content) {
            response.writeHead(200, {"Content-Type": "text/html"});
            response.end(content);
        });
    } else if(path.indexOf('/vendor') == 0 || path.indexOf('/hmi') == 0){
        filesLoader.getFile(path, response);
    } else {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end('good');
    }
}

function _post(request, response){

}

function _put(request, response){

}

function _delete(request, response){

}

function entryPoint(request, response) {
    
    switch(route.getMethod(request)) {
        case 'GET':
            _get(request, response);
            break;
        case 'POST':
            _post(request, response);
            break;
        case 'PUT':
            _put(request, response);
            break;
        case 'DELETE':
            _delete(request, response);
            break;
        default:
    }
}

server = http.createServer(entryPoint);
server.listen(PORT);
console.log("starting serveur on port " + PORT);