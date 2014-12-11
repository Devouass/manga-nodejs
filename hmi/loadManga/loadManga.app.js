var loadMangaApp = (function(){

	var _query = myApp.query;
	var sockjs_url = '/manga_sockjs';
	
	function ViewModel() {
		var self = this;

		var id = 0;
		function manga() {
			_self = this;
			this.id;
			this.chapter = "";
			this.page = "";
			this.status = "";

			this.fromJson = function(json){
				_self.chapter = json.chapter || "";
				_self.page = json.page || "";
				_self.status = json.status || "";
			}
		}
		this.mangas = ko.observableArray([]);

		var sockjs = new SockJS(sockjs_url);
		sockjs.onopen = function() {
			console.log("open connection : "+sockjs.protocol)
		};
		sockjs.onmessage = function(e) {
			console.log("receive message "+e.data);
			var d = JSON.parse(e.data);
			var m = new manga();
			m.fromJson(d)
			m.id = id;
			id++;
			self.mangas.push(m);
			self.mangas.valueHasMutated();
		};
		sockjs.onclose = function() {
			console.log("close connection")
		};

	    this.fromTome = ko.observable("1");
	    this.toTome = ko.observable("1");
	    this.launchUploadEnable = ko.observable(true);

	    this.launchUploadEnableComputed = ko.computed(function(){
	    	return self.fromTome() != "" && self.toTome() != "";
	    })
	    this.launchUploadEnableComputed.subscribe(function(b){
	    	self.launchUploadEnable(b)
	    })

	    this.launchUpload = function() {
	    	var data = {};
	    	data.first= self.fromTome();
	    	data.last = self.toTome();
	    	_query.post('/manga', data, function(result, status){}, this, {});
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

