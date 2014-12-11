var filesLoader = (function() {

	var Status = {
        SUCCESS: 'success',
        ERROR: 'error',
        ABORT: 'abort',
        NOCONTENT: 'nocontent',
        TIMEOUT: 'timeout'
    }

	var Methods = {
        PUT: 'PUT',
        GET: 'GET',
        POST: 'POST',
        DELETE: 'DELETE'
    }

	query = function(method, url, data, callbacks, context, opts) {

		if (typeof (callbacks) == 'function') {
            callbacks = {
                complete: callbacks
            }
        }
        
        callbacks = $.extend({
            success: function () { },
            fail: function () { },
            complete: function () { }
        }, callbacks);

        var options = {
            silent: false,
            delay: 500,
            dataType: undefined,
            domain: undefined,
            timeout: undefined,
            contentType: 'application/json;charset=utf-8'
        }

        var currentRequest = {
            method: method,
            url: url,
            data: data,
            callbacks: callbacks,
            context: context,
            options: opts,
            startedAt: new Date().getTime()
        }

        var opts = opts || {};
        opts = $.extend(options, opts);

        if (method == Methods.POST || method == Methods.PUT) {
            data = (data && data != {}) ? JSON.stringify(data) : null
        }

		var params = {
            type: method,
            url: url,
            data: data,
            asyn: opts.async,
            dataType: opts.dataType,
            contentType: opts.contentType,
            context: currentRequest,
            cache: null,
            timeout: null
        };

        if (opts.cache != undefined && opts.cache != null) {
            params.cache = opts.cache
        }

        if (opts.timeout != undefined && !isNaN(opts.timeout)) {
            params.timeout = opts.timeout
        }

        var jqXHR = $.ajax(params);

        jqXHR.done(function (data, textStatus, jqXHR) {
            if (this.callbacks.success) {
                this.callbacks.success.call(this.context, data, textStatus, jqXHR)
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            if (this.callbacks.fail) {
                this.callbacks.fail.call(this.context, data, textStatus, jqXHR)
            }
        }).always(function (data, textStatus, jqXHR) {  
            if (this.callbacks.complete) {
                this.callbacks.complete.call(this.context, data, textStatus, jqXHR)
            }
        });

        return jqXHR
	}

	get = function(url, callback, context, opts){
		query(Methods.GET, url, null, callback, context, opts);
	}

	put = function(url, data, callback, context, opts){
		query(Methods.PUT, url, data, callback, context, opts);
	}

	post = function(url, data, callback, context, opts){
		query(Methods.POST, url, data, callback, context, opts);
	}

	var _floaders = {
		STATUS: Status,
		get: get,
		put: put,
		post: post
	};
	return _floaders;
})();     