pcf = {
	adIsExpanded: false,
	closeCallback: null,
	geocoder: null,
	gmapsUrl: 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false',
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
	        return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
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
		if(this.isMraid){
			mraid.close();
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
		if(this.isMraid){
			this.adIsExpanded = true;
		}
	},
	geolocation: function(vars, callback){
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
		var self = this;
		navigator.geolocation.getCurrentPosition(function(position){
			var location = {
				'lat': position.coords.latitude,
				'lng': position.coords.longitude
			}
            callback(location);
        },function(e){
        	if(failover){
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
	gmaps_draw: function(vars){
		var mapZoom = 10;
		if(typeof(vars.map_zoom) != 'undefined'){
			mapZoom = vars.map_zoom;
		}
		var mapOptions = {
	        zoom: mapZoom,
	        center: new google.maps.LatLng(vars.lat, vars.lng),
	        disableDefaultUI: true,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    if(typeof(vars.map_id) == 'undefined'){
	    	console.log('A map id must be specified');
	    	return false;
	    }
	    else{
	    	if(typeof(vars.map_id) == 'string'){
	    		vars.map_id = this.gid(vars.map_id);
	    	}
	    }
	    var map = new google.maps.Map(vars.map_id, mapOptions);
	    for (var i in vars.markers) {
	        var marker = vars.markers[i];
	        var myLatLng = new google.maps.LatLng(marker.lat, marker.lng);
	        var marker = new google.maps.Marker( {
	            position: myLatLng,
	            map: map,
	            title: marker.title,
	            zIndex: marker.zIndex
	        } );
	        if(typeof(marker.clickthru) != 'undefined'){
	        	google.maps.event.addListener(marker, 'click', function() {
		            var url = 'http://maps.google.com/?saddr='+vars.lat+','+vars.lng+'&daddr='+marker.lat+','+marker.lng;
		            if(this.isPhad){
		            	ph.u.clickthru(url, 'GoogleMaps', marker.clickthru.name, this.sessionID);
		            }
		            else{
		            	console.log(marker.clickthru.name);
		            	window.open(url, '_blank');
		            }
		        });
	        }
    	}
	},
	gmaps_init: function(callback){
		if(this.isPhad){
			ph.l.load(gmapsUrl);
		}
		else{
			var gHead = document.getElementsByTagName('head').item(0);
			var gScript= document.createElement("script");
			gScript.type = "text/javascript";
			gScript.src= gmapsUrl;
			gHead.appendChild( gScript);
		}
	},
	gmaps_geo: function(vars){
		if(this.geocoder == null){
			this.geocoder = new google.maps.Geocoder();
		}
		var self = this;
		geocoder.geocode( { 'address': vars.address}, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK) {
				vars.callback(results);
	         }
	         else{
	         	if(typeof(vars.failover) != 'undefined'){
	         		if(vars.failover){
	         			self.geolocation(false, vars.callback);
	         		}
	         	}
	         }
	    });
	},
	init: function(callback){
		var self = this;
		self.closeCallback = callback;
		self.iosVersion = self.iosVersionCheck();
		if (typeof(mraid) != "undefined"){
		    self.isMraid = true;
		    mraid.setExpandProperties({useCustomClose:true});
		    mraid.addEventListener('stateChange', function(){
		        if(self.adIsExpanded){
		            self.closeCallback();
		            self.adIsExpanded = false;
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
	sessionImport: function(vars){
		for(var i in vars){
			this[i] = vars[i];
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
			if(typeof(vars.hide_close_btn) != 'undefined'){
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
		},500);
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