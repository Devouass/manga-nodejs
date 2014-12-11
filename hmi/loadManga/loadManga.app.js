var loadMangaApp = (function(){

	var _query = myApp.query;


	function ViewModel() {
		var self = this;

	    this.fromTome = ko.observable("");
	    this.toTome = ko.observable("");
	    this.launchUploadEnable = ko.observable(false);

	    this.launchUploadEnableComputed = ko.computed(function(){
	    	return self.fromTome() != "" && self.toTome() != "";
	    })
	    this.launchUploadEnableComputed.subscribe(function(b){
	    	self.launchUploadEnable(b)
	    })

	    this.launchUpload = function() {
	    	var data = {};
	    	data.startTom = self.fromTome();
	    	data.toTome = self.toTome();
	    	_query.post('/manga', data, function(result, status){
	    		console.log("status " + status);
				console.log("result " + result);
	    	}, this, {});
	    };
	} 

	var viewModel;
	var _content;
	var isReady = ko.observable(false);

	var _loadContent = function(callback) {

		$.ajax({
			url: '/hmi/loadManga/content.html',
			cache: true
		}).done(function(data, status){
			_content = data;
			if(callback){
				callback();
			}
		}).fail(function(data, status) {
			console.log(status)
			console.log("fail")
		}).always(function(data, status) {});
	}

	var init = function() {
		viewModel = new ViewModel();
		_loadContent(function(){
			isReady(true);
		});
	}

	var show = function() {
		$( "#applicationContainer" ).append(_content);
		ko.applyBindings(viewModel, $("#applicationContainer").get()[0]);
	}

	var hide = function() {
		$( "#applicationContainer" ).empty();
	}

	var _loadManga = {
		isReady : isReady,
		init: init,
		show : show,
		hide : hide
	};

	return _loadManga;
}());

