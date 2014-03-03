/*Phluant Client Framework v0.9 | (c) 2014 Phluant, Inc. All rights Reserved | See documentation for more details*/
pcf = {
	adIsExpanded: false,
	closeCallback: null,
	geocoder: null,
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
	webServiceUrl: 'http://lbs.phluant.com/web_services/',
	ajax: function(vars){
		ajaxRequest = new XMLHttpRequest(); 
		var sendData = '';
		if(typeof(vars.data) != 'undefined'){
				for(var i in vars.data){
				if(sendData != ''){
					sendData += '&';
				}
				sendData += i+'='+encodeURIComponent(vars.data[i]);
			}
		}
		if(vars.method == 'GET' && sendData != ''){
			vars.url += '?'+sendData;
		}
		var timeout = 10000;
		if(typeof(vars.timeout) == 'number'){
			timeout = vars.timeout;
		}
		ajaxRequest.open(vars.method, vars.url, true);
		if(vars.method == 'POST'){
			ajaxRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			ajaxRequest.send(sendData);
		}
		else{
			ajaxRequest.send();
		}
		var ajaxTimeout = setTimeout(function(){
			ajaxRequest.abort();
			if(typeof(vars.callback) != 'undefined'){
				vars.callback({
					'status': 'timeout',
				});
			}
		},timeout);
		ajaxRequest.onreadystatechange = function(){
			clearTimeout(ajaxTimeout);
			if (ajaxRequest.readyState == 4 && ajaxRequest.status == 200) {
				if(typeof(vars.js_object) != 'undefined'){
					if(vars.js_object){
						ajaxRequest.responseText = JSON.stringify(ajaxRequest.responseText);
					}
				}
				if(typeof(vars.callback) != 'undefined'){
					vars.callback(ajaxRequest.responseText);
				}
        	}
        	else{
        		if(typeof(vars.callback) != 'undefined'){
	        		vars.callback({
	        			'status': 'error',
	        			'request_info': ajaxRequest
	        		});
	        	}
        	}
		}
    	
	},
	capitalize: function(str){
		return str.charAt(0).toUpperCase()+str.slice(1);
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
			this.video_close();
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
	image_tracker: function(url){
		if(this.isPhad){
			ph.u.addImage(url);
		}
		else{
			var img = document.createElement("img");
			img.src = url;
			document.getElementsByTagName('body')[0].appendChild(img);
		}
	},
	geolocation: function(vars){
		var varsExport = {
			'url': this.webServiceUrl+'geolocation/export',
			'method': 'GET',
			'callback': vars.callback,
			'js_object': true,
		};
		if(typeof(vars.data) == 'object'){
			for(var i in vars.data){
				varsExport.data[i] = vars.data[i];
			}
		}
		this.ajax(varsExport);
	},
	geolocation_prompt: function(vars){
		var self = this;
		navigator.geolocation.getCurrentPosition(function(position){
			var location = {
				'lat': position.coords.latitude,
				'lng': position.coords.longitude
			}
            vars.callback(location);
        },function(e){
        	if(vars.failover){
        		self.geolocation(vars);
        	}
        });
	},
	get_stores: function(vars){
		var varsExport = {
			'url': this.webServiceUrl+'phluant/export',
			'method': 'GET',
			'callback': vars.callback,
			'js_object': true,
			'data': {
				'limit': 3,
				'dist': 30
			}
		};
		if(typeof(vars.data.campaign_id) == 'undefined'){
			console.log('campaign_id is a required attribute for this function');
			return false;
		}
		for(var i in vars.data){
			varsExport.data[i] = vars.data[i];
		}
		varsExport.data.type = 'get_stores';
		this.ajax(varsExport);
	},
	gid: function(id){
		return document.getElementById(id);
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
	    if(typeof(vars.markers) != 'undefined'){
		    for (var i in vars.markers) {
		        var marker = vars.markers[i];
		        var myLatLng = new google.maps.LatLng(marker.lat, marker.lng);
		        var defaults = {
		        	position: myLatLng,
		        	map: map,
		        };
		        var ignore = ['lat', 'lng', 'clickthru'];
		        for(var m in marker){
		        	if(ignore.indexOf(marker[m]) != -1){
		        		defaults[m] = marker[m];
		        	}
		        }
		        var newMarker = new google.maps.Marker(defaults);
		        if(typeof(marker.clickthru) != 'undefined'){
		        	google.maps.event.addListener(newMarker, 'click', function() {
			            var url = 'http://maps.google.com/?saddr='+vars.lat+','+vars.lng+'&daddr='+marker.lat+','+marker.lng;
			            if(typeof(marker.clickthru.url) != 'undefined'){
			            	url = marker.clickthru.url;
			            }
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
    	}
	},
	gmaps_geo: function(vars){
		if(this.geocoder == null){
			this.geocoder = new google.maps.Geocoder();
		}
		var self = this;
		geocoder.geocode( { 'address': encodeURIComponent(vars.address)}, function(results, status) {
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
	init: function(vars){
		var self = this;
		if(typeof(vars.callback) != 'undefined'){
			this.closeCallback = vars.callback;
		}
		if(typeof(vars.expanded) != 'undefined'){
			if(vars.expanded){
				self.adIsExpanded = true;
			}
		}
		if (typeof(mraid) != "undefined"){
		    self.isMraid = true;
		    mraid.setExpandProperties({useCustomClose:true});
		    mraid.addEventListener('stateChange', function(){
		        if(self.adIsExpanded){
		        	if(typeof(self.closeCallback) != 'null'){
		        		self.closeCallback();
		        	}
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
	query_string: function(jsonConvert){
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
	session_import: function(vars){
		for(var i in vars){
			this[i] = vars[i];
		}
	},
	track: function(name){
		if(this.isPhad){
			ph.u.track('interaction', 'cint='+name, this.sessionID);
		}
		else{
			console.log(name);
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
			'aspect_ratio': '16:9',
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
		var ar = properties.aspect_ratio.split(':');
		if(properties.style.width == '0px' && properties.style.height == '0px'){
			console.log('at least a height or a width for the video element or its parent element must be declared');
			return false;
		}
		if(properties.style.width != '0px' && properties.style.height == '0px'){
			properties.style.height = properties.style.width.replace('px','')*(ar[1]/ar[0])+'px';
		}
		if(properties.style.width == '0px' && properties.style.height != '0px'){
			properties.style.width = properties.style.height.replace('px','')*(ar[0]/[1])+'px';
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
	        self.video_close();
	    });
	    ph_videoElement.addEventListener('webkitendfullscreen', function(){
	        self.video_close();
		});
	},
	video_close: function(){
		if(this.isPhad){
			ph.v.remove();
		}
		else{
			this.videoId.innerHTML = '';
		}
		this.videoPlaying = false;
		
	},
}
pcf.iosVersion = pcf.iosVersionCheck();
if(typeof(ph) == 'object'){
	pcf.isPhad = true;
}