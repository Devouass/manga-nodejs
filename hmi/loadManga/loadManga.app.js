var loadMangaApp = (function(){

	var _query = myApp.query;
	var sockjs_url = '/manga_sockjs';

	var conf = {};

	function mangaForChoice(name) {
		var _self = this;
		_self.name = name
		_self.id = "";
		_self.site = "";
		_self.lastChapterDownload=""
		_self.fromJson = function(json){
			_self.id = json.id;
			_self.site = json.site;
			_self.lastChapterDownload=json.lastDownloadChapter;
		}
		_self.toJson = function() {
			var j = {};
			j.id = _self.id;
			j.site = _self.site;
			return j;
		}
	}

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

		this.fromTome = ko.observable("");
	    this.toTome = ko.observable("");
		//for the select
		this.mangasChoice = ko.observableArray([]);
		this.mangaChoosen = ko.observable();
		this.mangaChoosen.subscribe(function(mgChoosen){
			self.fromTome(mgChoosen.lastChapterDownload);
			self.toTome("");
		})
		$.each(conf.manga, function(id, description) {
			var m = new mangaForChoice(description.name);
			m.fromJson(description);
			self.mangasChoice.push(m);
		});
		
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
					if(self.manga){
						self.manga.isPending(false);
					} else {
						window.alert("No manga found")
					}
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
					if(self.manga){
						self.manga.isPending(false);
					}
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
	    	return !self.isDownloadPending() && self.fromTome() != "" && (self.theLatest() || self.toTome());
	    }).extend({throttle:1});
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
	    	data.manga = self.mangaChoosen().toJson();
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

		var htmlLoaded = ko.observable(false);
		var cssLoaded = ko.observable(false);
		var configLoaded = ko.observable(false);

		var callCallback = ko.computed(function(){
			return htmlLoaded() && cssLoaded() && configLoaded();
		})

		callCallback.subscribe(function(b){
			if(b && callback){
				callback();
			}
		})

		$.ajax({
			url: '/hmi/loadManga/content.html',
			cache: true
		}).done(function(data, status){
			_content = data;
			htmlLoaded(true);
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
    			cssLoaded(true);
    		}
        }).always(function(data, status){});

        _query.get('/config', function(result, status){
			if(status == "success"){
				conf = result;
				console.log(conf);
    			configLoaded(true);
    		} else {
    			console.log("error when getting config");
    		}
        });
	}

	var init = function() {
		_loadContent(function(){
			viewModel = new ViewModel();
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

