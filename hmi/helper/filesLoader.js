var filesLoader = (function() {

	var _floaders = {};

	var _getScript = function(url, callback) {
		$.ajax({
			url: url,
			dataType: "script"
		}).done(function(data, textStatus, jqXHR) {
			callback.call(this.context, data, textStatus, jqXHR);
		}).always(function(){

		});
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
	}

	_floaders.load = _load;

	return _floaders;
})();