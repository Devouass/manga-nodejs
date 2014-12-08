(function(window, jquery, knockout) {

	var isLoaded = ko.observable(false);
	
	$( "#applicationContainer" ).load("/hmi/content.html", function() {
		isLoaded(true);
	});

	function AppViewModel() {

		this.isReady = ko.observable(false);
		this.ue = false;

		this.numberOfClicks = ko.observable(0);
        this.incrementClickCounter = function() {
            var previousCount = this.numberOfClicks();
            this.numberOfClicks(previousCount + 1);
        }

	    this.fromTome = ko.observable("");
	    this.toTome = ko.observable("");

	    var self = this;

	    this.uploadEnable = ko.computed(function(){
	    	return self.fromTome() != "" && self.toTome() != "";
	    });
	    this.uploadEnable.subscribe(function(b) {
	    	self.ue = b;
	    })


	    this.launchUpload = function() {
	    	if(this.ue){
	    		console.log('send request');
	    	} else {
	    		alert('please fill all field');
	    	}
	    };

	    this.isReady(true);
	}

	var viewModel = new AppViewModel(); 

	var isLoadedComputed = ko.computed(function() {
		return isLoaded() && viewModel.isReady();
	});

	isLoadedComputed.subscribe(function(b){
		ko.applyBindings(viewModel, document.getElementById('appContent'));
	});
})(window, $, ko);