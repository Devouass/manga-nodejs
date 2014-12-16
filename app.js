var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    filesLoader = require('./helper/filesLoader'),
    fileWriter = require('./helper/fileWriter'),
    querystring = require('querystring'),
    sockjs = require('sockjs');

var server;
var PORT = 8090;


//sockjs stuff
var sockServeur = sockjs.createServer();
var sockClients = {};

function broadcast(message) {
    for (var i in sockClients) {
        sockClients[i].write(JSON.stringify(message));
    }
}

sockServeur.on('connection', function(conn) {
    sockClients[conn.id] = conn;

    conn.on('data', function(message) {
        console.log('message received... '+message);
    })

    conn.on('close', function() {
        delete sockClients[conn.id];
    })
})

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
        response.writeHead(404);
        response.end('Not Found');
    }
}

function isInt(value) {
  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
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
            callback(JSON.parse(queryData));
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

function sendError(response, message) {
    response.writeHead(400);
    if(message){console.log("error : " + message)}
    response.end(message || "error");
}

function _post(request, response){
    processPost(request, response, function(values){

        var path = url.parse(request.url).pathname + "";
        if(path.indexOf('/manga') == 0){
            var init = values.first;
            var end = values.last;
            if(!isInt(init) || (!isInt(end) && end != "theLast")){
                sendError(response, "invalid parameters");
            } else {
                fileWriter.getManga(init, end, broadcast);
                //response.writeHead(200, {"Content-Type": "application/json"});
                //response.end(/*JSON.stringify({result:'success'})*/);
                response.writeHead(200);
                response.end();
            }
        } else {
            sendError(response, "bad request");
        } 
    });
}

function _put(request, response){
    response.writeHead(204);
    response.end();
}

function _delete(request, response){

}

function getMethod(request) {
    return "" + request.method;
}

function entryPoint(request, response) {
    //var path = url.parse(request.url).pathname + "";
    //console.log(path);
    switch(getMethod(request)) {
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
sockServeur.installHandlers(server, {prefix:'/manga_sockjs'});
server.listen(PORT);
console.log("starting serveur on port " + PORT);