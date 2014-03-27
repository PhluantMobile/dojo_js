/*Dojo.js Framework v0.9 | (c) 2014 Phluant, Inc. All rights Reserved | See documentation for more details*/
dojo = {
	adInit: null,
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
	isDojo: false,
	isMraid: false,
	dojoConsoleLog: false,
	video_properties: {
		'aspect_ratio': '16:9',
		'attributes': {
			'webkit-playsinline': false,
			'controls': true,
			'autoplay': true,
		},
		'container_id': null,
		'close_callback': null,
		'full_screen': false,
		'pause_callback': null,
		'play_callback': null,
		'reload': false,
		'style': {
			'width': '320px',
			'height': '180px',
			'zIndex': 5000,
			'margin': 0,
			'padding': 0,
		},
	},
	videoPlaying: false,
	videoReload: false,
	videoInt: null,
	pl: null,
	unitID: null,
	webServiceUrl: 'http://lbs.phluant.com/web_services/',
	dojoUrl: 'http://staging.dojo.phluant.com/',
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
					var resp = ajaxRequest.responseText;
					if(vars.js_object){
						resp = JSON.parse(resp);
					}
				}
				if(typeof(vars.callback) != 'undefined'){
					vars.callback(resp);
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
		this.dojo_track({
			'type': 'click',
			'key': vars.name,
		});
		window.open(vars.url, '_blank');
	},
	contract: function(){
		if(this.videoPlaying){
			this.video_close();
		}
		if(this.isMraid){
			mraid.close();
		}
		this.dojo_track({
			'type': 'interaction',
			'key': 'contract',
		});
		this.closeCallback();
	},
	dojo_track: function(vars){
		if(!this.isDojo || this.dojoConsoleLog){
			console.log(vars.key);
		}
		if(this.isDojo){
			var url = this.dojoUrl+'rmstat?pl='+this.pl+'&adunit='+this.unitID+'&type='+vars.type+'&key='+vars.key+'&time='+new Date().getTime();
			this.image_tracker(url);
		}
		
	},
	expand: function(vars){
		//var logMsg = 'expanding to '+vars.width+'px width, '+vars.height+'px height.';
		this.dojo_track({
			'type': 'interaction',
			'key': 'expand',	
		});
		if(this.isMraid){
			this.adIsExpanded = true;
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
        	else{
        		vars.callback(false);
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
	        center: new google.maps.LatLng(vars.center_lat, vars.center_lng),
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
		        	if(typeof(marker.clickthru.url) != 'undefined'){
		        		newMarker.clickthru = marker.clickthru.url;
		        	}
		        	google.maps.event.addListener(newMarker, 'click', function() {
			            var url = 'http://maps.google.com/?saddr='+vars.user_lat+','+vars.user_lng+'&daddr='+this.position.k+','+this.position.A;
			            if(typeof(this.clickthru) != 'undefined'){
			            	url = this.clickthru;
			            }
		            	dojo.dojo_track({
							'type': 'click',
							'key': this.clickthru.name,
						});
			            window.open(url, '_blank');
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
		this.geocoder.geocode( { 'address': encodeURIComponent(vars.address)}, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK) {
				vars.callback(results);
	         }
	         else{
	         	if(typeof(vars.failover) == 'boolean'){
	         		if(vars.failover){
	         			var geoVars = {};
	         			geoVars.callback = vars.callback;
	         			if(typeof(vars.failover_callback) != 'undefined'){
	         				geoVars.callback = vars.failover_callback;
	         			}
	         			if(this.valid_zip(address)){
							geoVars.data.type =  'postal_code';
						}
						if(this.valid_geo(address)){
							geoVars.data.type =  'city_postal_by_geo';
						}
						if(typeof(geoVars.data.type) != 'undefined'){
							geoVars.data.value = vars.address;
						}
	         			self.geolocation(geoVars);
	         		}
	         	}
	         	else{
	         		vars.callback(false);
	         	}
	         }
	    });
	},
	image_tracker: function(url){
		var img = document.createElement("img");
		img.src = url;
		img.height = '1px';
		img.width = '1px';
		document.getElementsByTagName('body')[0].appendChild(img);
	},
	init: function(vars){
		var self = this;
		if(typeof(vars.callback) == 'function'){
			this.closeCallback = vars.callback;
		}
		if(typeof(vars.init) == 'function'){
			this.adInit = vars.init;
		}
		if(typeof(vars.expanded) != 'undefined'){
			if(vars.expanded){
				self.adIsExpanded = true;
			}
		}
		if(typeof(mraid) != "undefined"){
			if(this.adInit == null){
				console.log('An initialization function must be set for MRAID to work properly.');
				return false;
			}
			if(this.closeCallback == null){
				console.log('A close function must be set for MRAID to work properly.');
				return false;
			}
		    this.isMraid = true;
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
		    this.container.style.position="absolute";
		    var newMetaTag = document.createElement('meta');
		    newMetaTag.name = "viewport";
		    newMetaTag.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
		    document.getElementsByTagName('head')[0].appendChild( newMetaTag );
		}
		if(this.adInit != null){
			if(this.isMraid){
				if(mraid.getState() === 'loading'){
					mraid.addEventListener('viewableChange', self.mraid_ready);
				}
				else{
					this.mraid_ready();
				}
			}
			else{
				this.adInit();
			}
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
	mraid_ready: function(){
		if(mraid.isViewable){
			this.mraid_change();
		}
		else{
			mraid.addEventListener('viewableChange', this.mraid_change);
		}
	},
	mraid_change: function(){
		var self  = this;
		if (mraid.isViewable()) {
        	mraidResize(currW, currH);
        	setTimeout(function(){self.adInit();},125);
    	}
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
	roundIt: function(num, round){
		var roundTo = 1;
		if(round > 0){
			roundTo = Math.pow(10, round);
		}
		return Math.round(num*roundTo)/roundTo;
	},
	session_import: function(vars){
		for(var i in vars){
			this[i] = vars[i];
		}
	},
	shoplocal: function(vars){
		var varsExport = {
			'url': this.webServiceUrl+'phluant/export',
			'method': 'GET',
			'callback': vars.callback,
			'js_object': true,
			'data': {
				'call_type': 'store',
				'store_limit': 1,
				'cat_limit': 10
			}
		};
		for(var i in vars.data){
			varsExport.data[i] = vars.data[i];
		}
		var req = ['company', 'campaign_id'];
		for(var i=0; i<req.length; i++){
			if(typeof(varsExport.data[i]) == 'undefined'){
				console.log(req[i]+' is a required attribute for the shoplocal function.');
				return false;
			}
		}
		if(varsExport.data.call_type.indexOf('category') != -1 && typeof(varsExport.data.category_tree_id) == 'undefined'){
			console.log('category_tree_id must be defined for a shoplocal category lookup.');
			return false;
		}
		varsExport.data.type = 'shoplocal';
		this.ajax(varsExport);
	},
	track: function(name){
		this.dojo_track({
			'type': 'interaction',
			'key': name,
		});
	},
	valid_email: function(email){ 
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return filter.test(email);
    },
	valid_geo: function(geoTest){
		passed = true;
		geoTest = geoTest.split(',');
		if(typeof(geoTest) == 'object'){
			for(var i=0; i<geoTest.length; i++){
				if(isNaN(geoTest[i])){
					passed = false;
					break;
				}
			}
		}
		else{
			passed = false;
		}
		return passed;
	},
	valid_phone: function(phone_num){
	    if(phone_num){
	    	phone_num = phone_num.replace(/[^0-9]/g, '');
			return /^\d{10}/.test(zipTest);
	    };
	},
	valid_zip: function(zip){
       return /^\d{5}(-\d{4})?$/.test(zip);
    },
	video: function(vars){
		var self = this;
		this.videoPlaying = true;
		this.videoId = vars.container_id;
		if(typeof(this.videoId) == 'string'){
			this.videoId = this.gid(this.videoId);
		}
		objCheck = ['style', 'attributes'];
		if(!this.videoReload){
			for(var i in vars){
				if(objCheck.indexOf(i) != -1){
					for(var v in vars[i]){
						this.video_properties[i][v] = vars[i][v];
					}
				}
				else{
					this.video_properties[i] = vars[i];
				}
			}
		}
		if(this.video_properties.full_screen){
			this.video_properties.attributes['webkit-playsinline'] = false;
		}
		if(typeof(this.video_properties.container_id) == 'string'){
			this.video_properties.container_id = this.gid(this.video_properties.container_id);
		}
		var cid = this.video_properties.container_id;
		var ar = this.video_properties.aspect_ratio.split(':');
		if(this.video_properties.style.width == '0px' && this.video_properties.style.height == '0px'){
			console.log('At least a height or a width for the video element or its parent element must be declared');
			return false;
		}
		if(this.video_properties.style.width != '0px' && this.video_properties.style.height == '0px'){
			this.video_properties.style.height = this.video_properties.style.width.replace('px','')*(ar[1]/ar[0])+'px';
		}
		if(this.video_properties.style.width == '0px' && this.video_properties.style.height != '0px'){
			this.video_properties.style.width = this.video_properties.style.height.replace('px','')*(ar[0]/[1])+'px';
		}
		var videoHtml = '<video src="'+this.video_properties.video_url+'"></video>';
		cid.innerHTML = videoHtml;
		dojo_videoElement = cid.getElementsByTagName('video')[0];
		for(var i in this.video_properties.attributes){
			dojo_videoElement.setAttribute(i, this.video_properties.attributes[i]);
		}
		for(var i in this.video_properties.style){
			dojo_videoElement.style[i] = this.video_properties.style[i];
		}
		dojo_videoElement.addEventListener('play', function(){
			if(self.video_properties.full_screen){
				self.video_full_screen(elem);
			}
			if(typeof(self.video_properties.play_callback )== 'function'){
				self.video_properties.play_callback();
			}
		});
		dojo_videoElement.addEventListener('pause', function(){
			if(typeof(self.video_properties.pause_callback )== 'function'){
				self.video_properties.pause_callback();
			}
		});
		dojo_videoElement.addEventListener('loadedmetadata', function() {
			var quartiles = {
				'25': false,
				'50': false,
				'75': false,
			};
			var duration = dojo_videoElement.duration;
    		self.videoInt = setInterval(function(){
    			var check = self.roundIt(((dojo_videoElement.currentTime/duration)*100), 0);
    			for(var q in quartiles){
    				if(check == q && !quartiles[q]){
    					self.dojo_track({
							'type': 'video',
							'key': 'quartile'+q
						});
						quartiles[q] = true;
					}
    			}
    		},100);
		});
		if(this.video_properties.attributes.autoplay){
			setTimeout(function(){
				dojo_videoElement.play();
				self.dojo_track({
					'type': 'video',
					'key': 'play'
				});
			},500);
		}
		if(!this.video_properties.full_screen){
			dojo_videoElement.addEventListener('ended', function(){
		        self.video_close();
		    });
		}
	    dojo_videoElement.addEventListener('webkitendfullscreen', function(){
	        self.video_close();
		});
	},
	video_close: function(){
		this.video_properties.container_id.innerHTML = '';
		this.videoPlaying = false;
		clearInterval(this.videoInt);
		this.dojo_track({
			'type': 'video',
			'key': 'videoComplete'
		});
		if(typeof(this.video_properties.close_callback) == 'function'){
			this.video_properties.close_callback();
		}
		if(this.video_properties.reload){
			this.videoReload = true;
			this.video_properties.attributes.autoplay = false;
			this.video();
		}
	},
	video_full_screen: function(elem){
		var self = this;
		var endEvent = 'endfullscreen';
		if(elem.requestFullscreen) {
		    elem.requestFullscreen();
		}
		else if(elem.mozRequestFullScreen) {
		    elem.mozRequestFullScreen();
		    endEvent = 'mozendfullscreen';
		} 
		else if(elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
			endEvent = 'webkitendfullscreen';
		}
		else if(elem.msRequestFullscreen) {
		    elem.msRequestFullscreen();
		    endEvent = 'msendfullscreen';
		}
		elem.addEventListener(endEvent, function(){
	        self.video_close();
		});
	},
}
dojo.iosVersion = dojo.iosVersionCheck();
var metas = document.getElementsByTagName('meta');
for(var i=0; i<metas.length; i++){
	if (metas[i].getAttribute("name") == "apple-mobile-web-app-status-bar-style"){ 
        dojo.isDojo = true;
    } 
} 