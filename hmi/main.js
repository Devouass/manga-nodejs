(function(window, $, ko) {

	var myApp = {};
	window.myApp = myApp;

	$(document).ready(function(){
		//var isLoaded = ko.observable(false);

		myApp.query = filesLoader;

		//load script loadManga.app.js
		$.ajax({
			crossDomain: true,
			url: '/hmi/loadManga/loadManga.app.js',
			dataType: 'script',
			cache: true
		}).done(function(data, status) {
			loadMangaApp.init();
			loadMangaApp.isReady.subscribe(function(b) {
				loadMangaApp.show();
			});
		});
	});
	
})(window, $, ko);