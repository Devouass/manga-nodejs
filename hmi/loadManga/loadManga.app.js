var loadMangaApp = (function(){

	var _query = myApp.query;
	var sockjs_url = '/manga_sockjs';


	var id = 0;
	function manga() {
		_self = this;
		this.id;
		this.chapter = "";
		this.page = "";

		this.fromJson = function(json){
			_self.chapter = json.chapter || "";
			_self.page = json.page || "";
		}
	}

	function resumeManga(number) {
		this.number = number;
	}
	
	function ViewModel() {
		var self = this;
		this.fromTome = ko.observable("767");
	    this.toTome = ko.observable("768");
	    this.toTomeEnable = ko.observable(true);
	    this.theLatest = ko.observable(false);
	    this.launchUploadEnable = ko.observable(true);
	    this.isDownloadPending = ko.observable(false);
	    this.mangas = ko.observableArray([]);
	    this.resumeMangas = ko.observableArray([]);

		var sockjs = new SockJS(sockjs_url);
		sockjs.onopen = function() {
			console.log("open connection : "+sockjs.protocol)
		};
		sockjs.onmessage = function(e) {
			console.log("receive message "+e.data);
			var d = JSON.parse(e.data);
			if(d.status == "download finish") {
				console.log("download finish with success");
				self.isDownloadPending(false);
			}else if(d.status == "success"){
				var m = new manga();
				m.fromJson(d.manga)
				m.id = id;
				id++;
				self.mangas.push(m);
				self.mangas.valueHasMutated();
			} else if(d.status == "finished"){
				console.log("manga "+d.manga.chapter+" finished");
				var m = new resumeManga(d.manga.chapter);
				self.resumeMangas.push(m)
				self.resumeMangas.valueHasMutated();
			} else if(d.status == "pending"){
				console.log("manga "+d.manga.chapter+"/"+d.manga.page+" pending");
			} else if(d.status == "error"){
				console.log("download finished with error !!!!");
			} else {
				console.log("status received unknown : "+d.status);
			}
		};
		sockjs.onclose = function() {
			console.log("close connection")
		};

		this.theLatest.subscribe(function(b){
			self.toTomeEnable(!b);
		});

	    this.launchUploadEnableComputed = ko.computed(function(){
	    	return self.fromTome() != "" && (self.toTome() != "" || self.theLatest()) && !self.isDownloadPending();
	    })
	    this.launchUploadEnableComputed.subscribe(function(b){
	    	self.launchUploadEnable(b)
	    })

	    this.clearMangas = function() {
	    	self.mangas([]);
	    	self.mangas.valueHasMutated();
	    	self.resumeMangas([]);
	    	self.resumeMangas.valueHasMutated();
	    }

	    this.launchUpload = function() {
	    	self.clearMangas();
	    	var data = {};
	    	data.first= self.fromTome();
	    	if(self.theLatest()){
	    		data.last = "theLast";
	    	} else {
	    		data.last = self.toTome();
	    	}
	    	_query.post('/manga', data, function(result, status){
	    		if(status == "success"){
	    			console.log("starting download");
	    			self.isDownloadPending(true);
	    		} else {
	    			console.log("error");
	    			window.alert(result.responseText);
	    		}
	    		
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
		
		var cssRef = '/hmi/loadManga/css/style.css';
		
		$.ajax({
          url: cssRef,
          cache: true
    	}).done(function(data, status){
    		if(status == 'success'){
    			$('<link rel="stylesheet" type="text/css" href="'+cssRef+'" />').appendTo("head");
    		}
        }).always(function(data, status){});
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

