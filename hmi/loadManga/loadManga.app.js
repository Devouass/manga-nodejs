var loadMangaApp = (function(){

	var _query = myApp.query;
	var sockjs_url = '/manga_sockjs';


	var id = 0;
	function manga() {
		var _self = this;

		_self.id = "";
		_self.name = "";
		_self.chapter = "";
		_self.isPending = ko.observable(false);

		_self.fromJson = function(data){
			_self.name = data.name || "One piece";
			_self.chapter = data.chapter || "XX";
		}
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

	    //keep a reference to the manga downloaded actually!!
	    this.manga;

		var sockjs = new SockJS(sockjs_url);
		sockjs.onopen = function() {
			console.log("open connection : "+sockjs.protocol)
		};
		sockjs.onmessage = function(e) {
			console.log("receive message "+e.data);
			var d = JSON.parse(e.data);
			switch(d.status) {
				case "download finish":
					self.manga.isPending(false);
					self.isDownloadPending(false);
					break;
				case "newManga":
					self.manga = new manga();
					self.manga.id = id;
					id++;
					self.manga.fromJson(d.manga);
					self.manga.isPending(true);
					self.mangas.push(self.manga);
					self.mangas.valueHasMutated();
					break;
				case "success":
					console.log("success");	
					break;
				case "finished":
					self.manga.isPending(false);
					console.log("manga "+d.manga.chapter+" finished");
					break;
				case "pending":
					console.log("manga "+d.manga.chapter+"/"+d.manga.page+" pending");
					break;
				case "error":
					console.log("download finished with error !!!!");
					break;
				default:
					console.log("status received unknown : "+d.status);
					break;

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

