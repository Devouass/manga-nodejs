var filesLoader = (function() {

	var _floaders = {};

	var _getScript = function(url, callback, context) {

		if(!url){
			console.log('error!! no url for getting script');
		} else {
			$.ajax({
				url: url,
				dataType: "script"
			}).done(function (data, textStatus, jqXHR) {
				if(callback) {
					callback.call(context || this, data, textStatus, jqXHR);
				}
			}).always(function (data, textStatus, jqXHR) {
 
			});
		}
	}

	var _get = function(){
		
		var callbacks = {
			sucess: function() {},
			fail: function() {},
			complete: function () {}
		};

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

	_load = function(path) {
		console.log("load "+path);
		alert(path);
	}

	_floaders.load = _load;

	return _floaders;
})();


       
        /*static Status = {
            SUCCESS: 'success',
            ERROR: 'error',
            ABORT: 'abort',
            NOCONTENT: 'nocontent',
            TIMEOUT: 'timeout'
        }

        
        static Methods = {
            PUT: 'PUT',
            GET: 'GET',
            POST: 'POST',
            DELETE: 'DELETE'
        }


        static States = {
            REJECTED: 'rejected'
        }


        private mergeOptions(opts: IQueryOptions): IQueryOptions {
            var tmp = $.extend({}, this.opts)
            return <IQueryOptions>$.extend(tmp, opts || {})
        }

        static query(method: string, url: string, data: any, callbacks: any = {}, context?, opts: IQueryOptions = {}): JQueryXHR {
            
            if (Query.isLocked()) {
                return;
            }
            
            method = (method || 'GET').toUpperCase()

            var options: IQueryOptions = {
                silent: false,
                delay: Query.DEFAULT_DELAY,
                dataType: undefined,
                domain: undefined,
                timeout: undefined,
                contentType: 'application/json;charset=utf-8'
            }

            options = $.extend(options, Query.defaultOptions)
            opts = $.extend(options, opts)

            if (!opts.silent) {
                if (Query.nbQueries() == 0) {
                    _timer = setTimeout(function () {
                        Query.isBusy(true)
                    }, opts.delay)
                }
                var nb: number = Query.nbQueries() + 1
                Query.nbQueries(nb)
            }

            if (typeof (callbacks) == 'function') {
                callbacks = {
                    complete: callbacks
                }
            }
            
            callbacks = $.extend({
                success: function () { },
                fail: function () { },
                complete: function () { }
            }, callbacks)

            data = data || {}
            //@obsolete Use cache option instead
            data._timestamp = opts.upToDate ? "" + new Date().getTime() : undefined

            if (opts.domain) {
                if (url.indexOf('?') <= 0) {
                    url = url + "?"
                } else {
                    url = url + "&"
                }
                
                url = url + "_domain=" + opts.domain
            }

            _requestCount++;

            var currentRequest: IQueryRequest = {
                ID: _requestCount,
                method: method,
                url: url,
                data: data,
                callbacks: callbacks,
                context: context,
                options: opts,
                startedAt: new Date().getTime()
            }

            _currentStackRequests[currentRequest.ID] = currentRequest

            if (method == Query.Methods.POST || method == Query.Methods.PUT) {
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
            }

            if (opts.cache != undefined && opts.cache != null) {
                params.cache = opts.cache
            }

            if (opts.timeout != undefined && !isNaN(opts.timeout)) {
                params.timeout = opts.timeout
            }

            var jqXHR: JQueryXHR = $.ajax(params)

            jqXHR.done(function (data, textStatus, jqXHR) {
                if (this.callbacks.success) {
                    this.callbacks.success.call(this.context, data, textStatus, jqXHR)
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                    if (this.callbacks.fail) {
                        this.callbacks.fail.call(this.context, data, textStatus, jqXHR)
                }
            }).always(function (data, textStatus, jqXHR) {
                
                delete _currentStackRequests[this.ID]

                if (textStatus == Query.Status.NOCONTENT) {
                    textStatus = Query.Status.SUCCESS
                }

                if (textStatus == Query.Status.ERROR) {
                    if ($.inArray(data.status, [0, 12029, 12007]) != -1) {
                        Query.isDisconnected(true)
                    }
                }
                
                if (textStatus == Query.Status.SUCCESS && Query.isDisconnected()) {
                    Query.isDisconnected(false)
                }
                
                if (this.callbacks.complete) {
                    this.callbacks.complete.call(this.context, data, textStatus, jqXHR)
                }
                if (!this.options.silent) {
                    Query.nbQueries(Query.nbQueries() - 1)
                    if (Query.nbQueries() == 0) {
                        clearTimeout(_timer)
                        _timer = null
                        Query.isBusy(false)
                    }
                }
            })

            return jqXHR
        }*/

       