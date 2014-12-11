var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    route = require('./helper/routes'),
    filesLoader = require('./helper/filesLoader'),
    fileWriter = require('./helper/fileWriter'),
    server,
    querystring = require('querystring');

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
        response.writeHead(404, {"Content-Type": "text/html"});
        response.end('Not Found');
    }
}

var callbackGetManga = function(result) {
    console.log(result);
}

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            //request.post = querystring.parse(queryData);
            callback(queryData);
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

function _post(request, response){
    processPost(request, response, function(values){
        var start = values.startTom;
        var stop = values.endTom;
        console.log(values);
        //fileWriter.getManga(start,stop,callbackGetManga);
        response.writeHead(200, {"Content-Type": "application/json"});
        response.end(JSON.stringify({result:'success'}));
    });
}

function _put(request, response){
    console.log('in put method');
    response.writeHead(204);
    response.end();
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