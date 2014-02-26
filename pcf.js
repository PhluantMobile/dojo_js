pcf = {
	adIsExpanded: false,
	closeCallback: null,
	iosVersion: null,
	isMobile: {
	    Android: function() {
	        return navigator.userAgent.match(/Android/i);
	    },
	    BlackBerry: function() {
	        return navigator.userAgent.match(/BlackBerry/i);
	    },
	    iOS: function() {
	        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	    },
	    Opera: function() {
	        return navigator.userAgent.match(/Opera Mini/i);
	    },
	    Windows: function() {
	        return navigator.userAgent.match(/IEMobile/i);
	    },
	    any: function() {
	        return (this.isMobile.Android() || this.isMobile.BlackBerry() || this.isMobile.iOS() || this.isMobile.Opera() || this.isMobile.Windows());
	    }
	},
	isMraid: false,
	isPhad: false,
	videoPlaying: false,
	videoId: null,
	hashtag: null,
	executionID: null,
	campaignID: null,
	sessionID: null,
	gId: null,
	webServiceUrl: 'http://lbs.phluant.com/web_services/',
	ajax: function(vars, callback){
		ajaxRequest = new XMLHttpRequest(); 
		var sendData = '';
		if(typeof(vars.data) != 'undefined'){
				for(var i in vars.data){
				if(sendData != ''){
					sendData += '&';
				}
				sendData += i+'='+vars.data[i];
			}
		}
		if(vars.method == 'GET' && sendData != ''){
			vars.url += '?'+sendData;
		}
		ajaxRequest.open(vars.method, vars.url, true);
		if(vars.method == 'POST'){
			ajaxRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			ajaxRequest.send(sendData);
		}
		else{
			ajaxRequest.send();
		}
		ajaxRequest.onreadystatechange = function(){
			if (ajaxRequest.readyState == 4 && ajaxRequest.status == 200) {
            	callback(ajaxRequest.responseText);
        	}
        	else{
        		callback(false);
        	}
		}
    	
	},
	clickthru: function(vars){
		if(this.isPhad){
			ph.u.clickthru(vars.url, vars.name, this.sessionID);
		}
		else{
			console.log(vars.name);
			window.open(vars.url, '_blank');
		}
	},
	contract: function(){
		if(this.videoPlaying){
			this.videoClose();
		}
		if(this.isPhad){
			ph.t.close("MainPanel", this.sessionID);
		}
		else{
			console.log('contracting');
		}
		this.closeCallback();
	},
	expand: function(vars){
		if(this.isPhad){
			ph.t.expand('MainPanel', this.sessionID, false, {'width' : vars.width, 'height' : vars.height});
		}
		else{
			console.log('expanding to '+vars.width+'px width, '+vars.height+'px height.');
		}
	},
	geolocation: function(vars, callback){
		console.log('in geolocation');
		var varsExport = {
			'url': this.webServiceUrl+'geolocation/export',
			'method': 'GET',
		};
		if(typeof(vars) == 'object'){
			for(var i in vars){
				varsExport.data[i] = vars[i];
			}
		}
		this.ajax(varsExport, callback);
	},
	geolocation_prompt: function(failover, callback){
		console.log('in geolocation prompt function');
		var self = this;
		navigator.geolocation.getCurrentPosition(function(position){
			var location = {
				'lat': position.coords.latitude,
				'lng': position.coords.longitude
			}
            callback(location);
        },function(e){
        	if(failover){
        		console.log(callback);
        		self.geolocation(false, callback);
        	}
        });
	},
	get_stores: function(vars, callback){
		var varsExport = {
			'url': this.webServiceUrl+'phluant/export',
			'method': 'GET',
			'data': {
				'type': 'get_stores',
			}
		};
		var required = ['campaign_id'];
		for(var i=0; i<requried.length; i++){
			if(typeof(vars[required[i]]) == 'undefined'){
				console.log(required[i]+' is a required attribute for this function');
				return false;
			}
		}
		for(var i in vars){
			varsExport.data[i] = vars[i];
		}
		this.ajax(varsExport, callback);
	},
	gid: function(id){
		if(this.isPhad){
			return this.gId(id);
		}
		else{
			return document.getElementById(id);
		}
	},
	import: function(vars){
		for(var i in vars){
			this[i] = vars[i];
		}
	},
	init: function(callback){
		this.closeCallback = callback;
		this.iosVersion = this.iosVersionCheck();
		var self = this;
		if (typeof(mraid) != "undefined"){
		    isMraid = true;
		    mraid.setExpandProperties({useCustomClose:true});
		    mraid.addEventListener('stateChange', function(){
		        if(ph_adIsExpanded){
		            self.closeCallback():
		            adIsExpanded = false;
		        }
		    });
		    document.body.style.margin="0px";
		    container.style.position="absolute";
		    var newMetaTag = document.createElement('meta');
		    newMetaTag.name = "viewport";
		    newMetaTag.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
		    document.getElementsByTagName('head')[0].appendChild( newMetaTag );
		}
	},
	iosVersionCheck: function() {
	    var agent = window.navigator.userAgent,
	        start = agent.indexOf( 'OS ' );
	    if( ( agent.indexOf( 'iPhone' ) > -1 || agent.indexOf( 'iPad' ) > -1 ) && start > -1 ){
	        return window.Number( agent.substr( start + 3, 3 ).replace( '_', '.' ) );
	    }
	    return 0;
	},
	queryString: function(jsonConvert){
		var url = window.location.href;
		if(url.indexOf('?') != -1){
			var urlObj = new Object();
			var qString = url.split('?');
			var params = qString[1].split('&');
			for(var i=0; i<params.length; i++){
				var result = params[i].split('=');
				urlObj[result[0]] = decodeURIComponent(result[1]);
			}
			if(jsonConvert){
				urlObj = JSON.stringify(urlObj);
			}
			return urlObj;
		}
		else{
			return false;
		}
	},
	track: function(vars){
		if(this.isPhad){
			ph.u.track('interaction', 'cint='+vars.name, this.sessionID);
		}
		else{
			console.log(vars.name);
		}
	},
	video: function(vars){
		var self = this;
		this.videoPlaying = true;
		this.videoId = vars.container_id;
		if(typeof(this.videoId) == 'string'){
			this.videoId = this.gid(this.videoId);
		}
		var properties = {
			'style': {
				'width': this.videoId.offsetWidth+'px',
				'height': this.videoId.offsetHeight+'px',
				'zIndex': 5000,
				'margin': 0,
				'padding': 0,
			},
			'attributes': {
				'webkit-playsinline': false,
				'controls': true,
			}	
		};
		if(typeof(vars.style) != 'undefined'){
			for(var i in vars.style){
				properties.style[i] = vars.style[i];
			}
		}
		if(properties.style.width == '0px' && properties.style.height == '0px'){
			console.log('at least a height or a width for the video element or its parent element must be declared');
			return false;
		}
		if(properties.style.width != '0px' && properties.style.height == '0px'){
			properties.style.height = properties.style.width.replace('px','')*(9/16)+'px';
		}
		if(properties.style.width == '0px' && properties.style.height != '0px'){
			properties.style.width = properties.style.height.replace('px','')*(16/9)+'px';
		}
		if(this.isPhad){
			ph.v.play(vars.video_url, vars.name, this.campaignID, this.executionID, this.sessionID, this.videoId);
			console.log(vars);
			console.log(typeof(vars.hide_close_btn));
			if(typeof(vars.hide_close_btn) != 'undefined'){
				console.log('defined');
				console.log(vars.hide_close_btn);
				if(vars.hide_close_btn){
					phVidClose.style.display = 'none';
				}
			}
		}
		else{
			var videoHtml = '<video src="'+vars.video_url+'"></video>';
			this.videoId.innerHTML = videoHtml;
		}
		ph_videoElement = this.videoId.getElementsByTagName('video')[0];
		for(var i in properties.attributes){
			if(typeof(vars.attributes[i]) != 'undefined'){
				properties.attributes[i] = vars.attributes[i];
			}
			ph_videoElement.setAttribute(i, properties.attributes[i]);
		}
		for(var i in properties.style){
			ph_videoElement.style[i] = properties.style[i];
		}
		
		setTimeout(function(){
			ph_videoElement.play();
		});
		 ph_videoElement.addEventListener('ended', function(){
	        self.videoClose();
	    });
	    ph_videoElement.addEventListener('webkitendfullscreen', function(){
	        self.videoClose();
		});
	},
	videoClose: function(){
		if(this.isPhad){
			ph.v.remove();
		}
		else{
			this.videoId.innerHTML = '';
		}
		this.videoPlaying = false;
		
	},
}
if(typeof(ph) == 'object'){
	pcf.isPhad = true;
}
console.log(pcf.isPhad);