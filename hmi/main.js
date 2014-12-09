(function(window, $, ko) {

	$(document).ready(function(){
		var isLoaded = ko.observable(false);

		var fLoader = filesLoader;

		function AppViewModel() {

			var self = this;
			this.isReady = ko.observable(false);

		    this.fromTome = ko.observable("");
		    this.toTome = ko.observable("");   

		    this.launchUpload = function() {
		    	/*if(self.fromTome() != "" && self.toTome() != ""){
		    		console.log('send request');
		    	} else {
		    		alert('please fill all field');
		    	}*/
		    	fLoader.load('/toto');
		    };

		    this.isReady(true);
		}

		var viewModel = new AppViewModel();
		$( "#applicationContainer" ).load("/hmi/content.html", function() {
			isLoaded(true);
		});

		var isLoadedComputed = ko.computed(function() {
			return isLoaded() && viewModel.isReady();
		});

		isLoadedComputed.subscribe(function(b){
			ko.applyBindings(viewModel, document.getElementById('appContent'));
		});
	});
	
})(window, $, ko);