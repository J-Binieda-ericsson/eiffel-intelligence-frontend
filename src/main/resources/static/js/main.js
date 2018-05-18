
jQuery(document).ready(function() {

	// Fetch injected URL from DOM
	var eiffelDocumentationUrlLinks = $('#eiffelDocumentationUrlLinks').text();
	var frontendServiceUrl = $('#frontendServiceUrl').text();

	function loadMainPage() {
		$("#mainFrame").load("subscriptionpage.html");
	}

	$("#testRulesBtn").click(function() {
		$("#mainFrame").load("testRules.html");
	});

	$("#eiInfoBtn").click(function() {
		$("#mainFrame").load("eiInfo.html");
	});

	$("#loginBtn").click(function() {
		$("#mainFrame").load("login.html");
	});

	$("#addInstanceBtn").click(function() {
      	$("#mainFrame").load("add-instances.html");
    });

    $("#switcherBtn").click(function() {
      	$("#mainFrame").load("switch-backend.html");
    });

	$("#logoutBtn").click(function() {
		$.ajax({
			url : "/auth/logout",
			type : "GET",
			contentType : 'application/json; charset=utf-8',
			cache: false,
			complete : function (XMLHttpRequest, textStatus) {
				doIfUserLoggedOut();
				loadMainPage();
			}
		});
	});

	$("#subscriptionBtn").click(function() {
		loadMainPage();
	});

	$("#jmesPathRulesSetUpBtn").click(function() {
		$("#mainFrame").load("jmesPathRulesSetUp.html");
	});

	function doIfUserLoggedOut() {
		localStorage.removeItem("currentUser");
		$("#userName").text("Guest");
		$("#loginBlock").show();
		$("#logoutBlock").hide();
	}

	function loadDocumentLinks(){
		// eiffelDocumentationUrlLinks variable is configure in application.properties
		var linksList = JSON.parse(eiffelDocumentationUrlLinks);
		var docLinksDoc = document.getElementById('collapseDocPages');
		var liTag = null;
		var aTag = null;

		Object.keys(linksList).forEach(function(linkKey) {
			liTag = document.createElement('li');
			aTag = document.createElement('a');
			aTag.innerHTML = linkKey;
			aTag.setAttribute('href', linksList[linkKey]);
			aTag.setAttribute('target', '_blanc');
			liTag.appendChild(aTag);
			docLinksDoc.appendChild(liTag);
		});
	}

	var initOneTime = function(){
		initOneTime = function(){}; // kill it as soon as it was called
		loadDocumentLinks();
		loadMainPage();
	};

	initOneTime();

    function singleInstanceModel(name, host, port, path, https, active) {
    	this.name = ko.observable(name),
    	this.host = ko.observable(host),
    	this.port = ko.observable(port),
    	this.path = ko.observable(path),
    	this.https = ko.observable(https),
        this.active = ko.observable(active),
	    this.information = name.toUpperCase() + " - " + host + " " + port + " " + path;
    }

    function viewModel(data) {
        var self = this;
        var currentName;
        self.instances = ko.observableArray();
        var json = JSON.parse(data);
        for(var i = 0; i < json.length; i++) {
            var obj = json[i];
        	var instance = new singleInstanceModel(obj.name, obj.host, obj.port, obj.path, obj.https, obj.active);
        	self.instances.push(instance);
        	if(obj.active == true){
        	    currentName = obj.name;
        	}
        }
        self.selectedActive = ko.observable(currentName);
        self.onChange = function(){
            $.ajax({
                url: frontendServiceUrl + "/switch-backendByMainPage",
            	type: "POST",
            	data: self.selectedActive(),
            	contentType: 'application/json; charset=utf-8',
            	cache: false,
            	error: function (XMLHttpRequest, textStatus, errorThrown) {
            	    $.jGrowl(XMLHttpRequest.responseText, {sticky: false, theme: 'Error'});
            	},
            	success: function (responseData, textStatus) {
            	    $.jGrowl("Backend instance was switched", {sticky: false, theme: 'Notify'});
            	}
            });
        }
    }
    $.ajax({
        url: frontendServiceUrl + "/get-instances",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        cache: false,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $.jGrowl(XMLHttpRequest.responseText, {sticky: false, theme: 'Error'});
        },
        success: function (responseData, textStatus) {
            ko.applyBindings(new viewModel(responseData));
        }
    });
});