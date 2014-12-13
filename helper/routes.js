getMethod = function(request) {
	return "" + request.method;
}

var routes = {};
routes.getMethod = getMethod;

module.exports = routes;