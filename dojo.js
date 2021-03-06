/*Dojo.js Framework v1.2.2 | (c) 2016 Phluant, Inc. All rights Reserved | See documentation for more details*/
(function(){
	window.dojo = {
		version: '1.2.2',
		adIsExpanded: false, /* TODO:  remove this stupid property */
		closeCallback: null,
		geocoder: null,
		iosVersion: null,
		isMobile: {
		    Android: function() {
		        return !!navigator.userAgent.match(/Android/i);
		    },
		    BlackBerry: function() {
		        return !!navigator.userAgent.match(/BlackBerry/i);
		    },
		    iOS: function() {
		        return !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
		    },
		    Opera: function() {
		        return !!navigator.userAgent.match(/Opera Mini/i);
		    },
		    Windows: function() {
		        return !!navigator.userAgent.match(/IEMobile/i);
		    },
		    any: function() {
		        return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
		    }
		},
		isDojo: false,
		isInterstitial: false,
		isMraid: false,
		winLoaded: false,
		videoElement: null,
		pl: null,
		unitID: null,
		webServiceUrl: 'http://lbs.phluant.com:8080/',
		dojoUrl: 'http://dojo.phluant.com/',
		mraidOrientationProperties: undefined,
		iframeEl: null,
		iframeContractSize: {},
		timeTrackingEndTime: 0,
		pageTimeInterval: undefined,
		elapsedTime: 0,
		expandedEl: null,
		useCustomClose: false,
		closeImg: null,

		addCloseButton: function() {
			if (this.closeImg && this.closeImg.parentElement) { return (this.closeImg.style.display = "block"); }
			this.closeImg = new Image();
			this.closeImg.style.cssText = "position: absolute; right:0; top:0; width: 45px; z-index: 999999;";
			this.closeImg.classList.add('close');
			var self = this;
			this.closeImg.addEventListener('click', function(e) {
				e.stopPropagation();
				self.contract.apply(self);
			});
			this.closeImg.src = "http://mdn4.phluantmobile.net/jslib/dojo/close.png";
			if (this.expandedEl) { this.expandedEl.appendChild(this.closeImg); }
		},
		removeCloseButton: function() {
			this.closeImg.style.display = "none";
		},

		ajax: function(vars){
			var ajaxRequest = new XMLHttpRequest();
			var sendData = '';
			var useYQL = false;
			var async = true;
			var self = this;
			if(typeof(vars.async) === 'boolean'){ async = vars.async; }
			if(vars.yql){ useYQL = true; }
			if(typeof(vars.data) !== 'undefined'){
				for (var i in vars.data) {
					if( vars.data.hasOwnProperty( i ) ) {
						sendData += ((sendData !== '')?'&':'') +
												i + '=' + encodeURIComponent(vars.data[i]);
					}
				}
			}
			if((vars.method !== 'POST' || useYQL) && sendData){
				vars.url += ((vars.url.indexOf('?') !== -1)?'&':'?')+sendData;
			}
			var timeout = 10000;
			if (typeof(vars.timeout) === 'number') { timeout = vars.timeout; }
			if(useYQL){
				var format = ((typeof(vars.yql.format) === 'string')? vars.yql.format : 'json');
				var yql = 'format='+format+'&q='+encodeURIComponent('select * from '+format+' where url="' +vars.url+ '"');
				vars.url = 'http://query.yahooapis.com/v1/public/yql';
				if(vars.method !== 'POST'){ vars.url += '?'+yql; }
				else { sendData = yql; }
			}
			ajaxRequest.open(vars.method, vars.url, async);

			if(typeof(vars.callback) !== 'undefined'){
				var ajaxTimeout = window.setTimeout(function(){
					ajaxRequest.abort();
					vars.callback({
						'status': 'error',
						'reason': 'timeout',
					});
				},timeout);
				ajaxRequest.onreadystatechange = function(){
					if (ajaxRequest.readyState === 4 && ajaxRequest.status >= 200 && ajaxRequest.status < 400) {
						window.clearTimeout(ajaxTimeout);
						var resp = ajaxRequest.responseText;
						if(typeof(vars.js_return) !== 'undefined' && vars.js_return){
							resp = ajaxRequest.getResponseHeader("Content-Type").indexOf('xml') !== -1 ? self.xmlToObject(resp, true): JSON.parse(resp);
						}
						var callbackVars = {
							'status': 'success',
						  'results': resp,
						  'info': ajaxRequest
						};
						if (useYQL && resp.query.count <= 0 && !resp.query.results) {
							callbackVars.status = 'No YQL Results';
						}
						vars.callback(callbackVars);
					}
					else if(ajaxRequest.readyState === 4){
						window.clearTimeout(ajaxTimeout);
						vars.callback({
							'status': 'error',
							'info': ajaxRequest,
						});
					}
				};
			}
			if(vars.method === 'POST'){
				ajaxRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");
				ajaxRequest.send(sendData);
			}
			else {
				ajaxRequest.send();
			}
		},
		capitalize: function(str){
			return str.charAt(0).toUpperCase()+str.slice(1);
		},
		clickthru: function(vars, silent){
			var tagParams = this.getTagParams();
			var prepend = tagParams.ClickPrependURL || tagParams.prependclickcontent;
			prepend = vars.prepend || prepend && decodeURIComponent(prepend);
			prepend = /^https?\:\/\/.*$/.test(prepend) ? prepend : false;

			this.dojo_track({'type': 'click','key': vars.name,});

			var url = tagParams.ClickthruURL && decodeURIComponent(tagParams.ClickthruURL) || vars.url;
			if (prepend) { url = prepend + encodeURIComponent(url); }
			if (!silent) { this.log('opening ' + url); }

			this.pageTime(false);
			if (this.isMraid) { mraid.open(url); }
			else { window.open(url, '_blank'); }
		},
		contract: function(width, height, e){
			if (!this.adIsExpanded) { return; }
			else { this.adIsExpanded = false; }

      if (this.videoElement && !this.videoElement.paused) {
        this.videoElement.pause();
        this.videoElement.fastSeek(0);
        this.videoElement.videoPlaying = false;
      }

      // Set mraid orientation properties back to original properties
      if (this.isMraid && this.mraidOrientationProperties) {
        try { mraid.setOrientationProperties(this.mraidOrientationProperties); }
        catch(f) { this.log("can't reset mraid orientation properties"); }
      }

      this.track('contract');
			this.pageTime(false);

			if (this.isMraid) {
				if ( mraid.getState() === 'expanded' ||
					   (mraid.getState() === 'default' && this.isInterstitial) ) {
					mraid.close();
				}
			}

			if (this.iframeEl) {
				if (typeof width === 'number') { width = width + 'px'; }
				if (typeof height === 'number') { height = height + 'px'; }
				this.iframeEl.style.width = width ? width : this.iframeContractSize.x + 'px';
				this.iframeEl.style.height = height ? height : this.iframeContractSize.y + 'px';
			}
			if (!this.isMraid && !this.useCustomClose) { this.removeCloseButton(); }

			if (this.closeCallback) { this.closeCallback(e); }
		},
		expand: function(width,height){
			var self = this;
			if (this.adIsExpanded) { return; }

			if (typeof(width) === 'number') { width += 'px'; }
			if (typeof(height) === 'number') { height += 'px'; }

			if (this.iframeEl) {
				this.iframeContractSize.x = this.iframeEl.offsetWidth;
				this.iframeContractSize.y = this.iframeEl.offsetHeight;

				if (width) { this.iframeEl.style.width = width; }
				if (height) { this.iframeEl.style.height = height; }
			}
			if (this.isMraid && !this.isInterstitial) { mraid.expand(); }

			if (!this.useCustomClose && !this.isMraid) {
				this.addCloseButton();
			}

      if (this.videoElement !== null && this.videoElement.shouldPlayOnExpand) {
        this.videoElement.play();
      }

      // Save initial mraid orientation properties
      if (this.isMraid) {
        try {
          self.mraidOrientationProperties = mraid.getOrientationProperties();
          mraid.setOrientationProperties({
            allowOrientationChange: false,
            forceOrientation: "portrait"
          });
        }
        catch(e) { this.log("can't set mraid orientation properties"); }
      }
      if (!this.isInterstitial) {
      	this.track('expand');
      }
			this.adIsExpanded = true;
			this.pageTime(true);
		},
		geolocation: function(vars){
			function runCallback(d) {
				d.status = d.results.status ? d.results.status : d.status;
				d.results = d.results.results ? d.results.results : d.results;
				vars.callback(d);
			}
			var varsExport = {
				'url': this.webServiceUrl+'geolocation/export',
				'method': 'GET',
				'callback': runCallback,
				'js_return': true,
			};
			if(typeof(vars.data) !== 'undefined'){
				varsExport.data = vars.data;
			}
			this.ajax(varsExport);
		},
		geolocation_prompt: function(vars){
			var resolved = false;

			navigator.geolocation.getCurrentPosition(success, error, {
				enableHighAccuracy: true,
				timeout: 7000,
				maximumAge: 0
			});

	    function success(position){
	    	if (resolved) { return; }
	    	else { resolved = true; }

				vars.callback({
					'lat': position.coords.latitude,
					'lng': position.coords.longitude
				});
    	}

    	function error(){
    		if (resolved) { return; }
    		else { resolved = true; }

    		/* TODO: normalize return data to be the
        	 same as above, to maintain consistency */
      	if (vars.failover) { dojo.geolocation(vars); }
      	else { vars.callback(false); }
      }

	    window.setTimeout(error, 8000);
		},
		getTagParams: function(){
			if (!dojo.isDojo) { return {}; }

			var scripts = document.getElementsByTagName('script');
			var i=0, tagScript = scripts[0];
			while (!tagScript.src.match(/dojo.phluant.com\/adj/)) { tagScript = scripts[++i]; }

			if (tagScript.src.indexOf('?') === -1) { return {}; }

			var params = tagScript.src.slice(tagScript.src.indexOf('?') +1).split('&');
			var parsedParams = {};
			params.forEach(function(param){
				var splitParam = param.split('=');
				parsedParams[splitParam[0]] = splitParam[1];
			});

			return parsedParams;
		},
		gmaps_draw: function(vars){
			if (vars.map_id === undefined) { return this.log('A map id must be specified'); }
			if (typeof(vars.map_id) === 'string') { vars.map_id = document.getElementById(vars.map_id); }

	    var map = new google.maps.Map(
	    	vars.map_id,
	    	{
	    		zoom: vars.map_zoom,
	        center: new google.maps.LatLng(vars.center_lat, vars.center_lng),
	        disableDefaultUI: true,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    	}
	    );

	    var bounds = new google.maps.LatLngBounds();
	    if (vars.markers) {
	    	vars.markers.forEach(function(marker){
	        marker.position = new google.maps.LatLng(marker.lat, marker.lng);
	        marker.map = map;

	        var gMarker = new google.maps.Marker(marker);

	        if (marker.clickthru) {
	        	google.maps.event.addListener(gMarker, 'click', function() {
							if (marker.clickthru.callback) { marker.clickthru.callback.call(this); }
							if (!marker.clickthru.url) {
								marker.clickthru.url = 'https://maps.google.com/?saddr='+ vars.user_lat +','+ vars.user_lng +'&daddr='+ this.position.lat() +','+ this.position.lng();
							}
							dojo.clickthru(marker.clickthru);
	        	});
	      	}

	        if (marker.events) {
	        	for (var event in marker.events) {
	        		if( marker.events.hasOwnProperty( event ) ) {
		    				google.maps.event.addListener(gMarker, event, marker.events[event]);
		    			}
		    		}
		    	}
	        bounds.extend(gMarker.position);
	    	});
	    }
	    if (vars.map_zoom === undefined) { map.fitBounds(bounds); }
	    return map;
		},
		/* TODO: remove the fallback callback and normalize the return data for callback */
		gmaps_geo: function(vars){
			if (!vars.callback) { return false; }
			if (!vars.loc_type) { vars.loc_type = 'address'; }
			if (!this.geocoder) { this.geocoder = new google.maps.Geocoder(); }

			var opts = {};
			if (['geo','latLng'].indexOf(vars.loc_type) !== -1) {
				if (!this.valid_geo(vars.address)) { return console.error('invalid lat/lng'); }

				var coords = vars.address.split(',');
				opts.latLng = new google.maps.LatLng(coords[0], coords[1]);
			}
			else { opts.address = vars.address; }

			this.geocoder.geocode(opts, function(results, status) {
				dojo.gmaps_return(results, status, vars);
			});
		},
		gmaps_return: function(results, status, vars){
			if (status === google.maps.GeocoderStatus.OK) {
				return vars.callback(results[0]);
			}
			else if (vars.failover) {
				var opts = {
					data: {value: vars.address},
					callback: vars.failover_callback || vars.callback,
				};

				/* TODO: don't wait until after the network request to do this check.
				   Also, shouldn't this be done inside the geolocation function? */
				if (this.valid_zip(vars.address)) { opts.data.type =  'postal_code'; }
				else if (this.valid_geo(vars.address)) { opts.data.type =  'city_postal_by_geo'; }
				else { return console.error("Fallback dojo.geolocate method won't work for address call"); }

				this.geolocation(opts);
			}
			else { vars.callback(false); }
		},
		image_tracker: function(url){
			var img = document.createElement("img");
			img.src = url;
			img.height = '1px';
			img.width = '1px';
			document.getElementsByTagName('body')[0].appendChild(img);
		},
		init: function(vars){
			this.closeCallback = vars.callback; // change arg name from 'callback' to make more clear
    	if (vars.expandedEl && typeof vars.expandedEl === "string") { // passed as ID
				this.expandedEl = document.getElementById(vars.expandedEl);
			} else if (!vars.expandedEl) { // not passed, try searching for element w "expanded" ID
				this.expandedEl = document.getElementById('expanded');
			} else { // passed as element
				this.expandedEl = vars.expandedEl;
			}

	    this.useCustomClose = vars.useCustomClose;
	    this.isInterstitial = vars.isInterstitial;

			var self = this;
			this.initMraid(function(){
				if (self.isMraid) { self.configMraid(); }
				if (self.isMraid && !self.winLoaded) {
					/* mraid failed to fire the load event, so we have to do it manually */
					self.winLoaded = true;
			    try { window.dispatchEvent(new Event('load')); }
			    catch(e) { /* deprecated event construction method */
			    	var loadEvent = document.createEvent('Event');
		        loadEvent.initEvent('load', true, true);
		        window.dispatchEvent(loadEvent);
			    }
				}
				if (vars.expanded || vars.isInterstitial) { self.expand(); }
				if (vars.init) { window.setTimeout(vars.init()); } /*delay callback until after doc load callbacks are fired*/
			});
		},
		configMraid: function(){
			var self = this;
			// list to close / contract events
			mraid.addEventListener('stateChange', function(e){
      	if (e === 'hidden' || (e === 'default' && self.adIsExpanded)) { self.contract(); }
    	});

	    mraid.setExpandProperties({'useCustomClose': this.useCustomClose});
		},
		initMraid: function(callback){
			this.isMraid = typeof(mraid) !== "undefined";

			if (!this.isMraid) { return callback(); }
			else if (mraid.getState() === 'loading') {
				mraid.addEventListener('ready', this.onMraidReady.bind(this,callback));
			}
			else { this.onMraidReady(callback); }
		},
		onMraidReady: function(callback){
			mraid.removeEventListener('ready');
			if (mraid.isViewable()) { callback(); }
			else { mraid.addEventListener('viewableChange', this.onMraidViewChange.bind(this,callback)); }
		},
		onMraidViewChange: function(callback, isItVisible){
			if (isItVisible) {
				mraid.removeEventListener('viewableChange');
				callback();
			}
		},
		iosVersionCheck: function() {
	    var agent = window.navigator.userAgent, start = agent.indexOf( 'OS ' );
	    if( ( agent.indexOf( 'iPhone' ) > -1 || agent.indexOf( 'iPad' ) > -1 ) && start > -1 ){
	      return window.Number( agent.substr( start + 3, 3 ).replace( '_', '.' ) );
	    }
	    return 0;
		},
		log: function(message, isAutoFired) {
			if (!this.isDojo) { console.log(message); }
			else {
				this.dojo_track({
					'type': 'Developer',
					'key': message,
				}, typeof isAutoFired === 'undefined' ? true : isAutoFired);
			}
		},
		pageTime: function(shouldStart) { // true will start the timer, false will stop it
			var self = this;
			if (shouldStart && self.adIsExpanded) {
				if (self.elapsedTime >= 180 || self.elapsedTime !== self.timeTrackingEndTime) {
					return (self.timeTrackingEndTime = self.elapsedTime + 20);
				}
				self.timeTrackingEndTime = self.timeTrackingEndTime ? self.elapsedTime + 15 : 15;
				window.clearInterval(self.pageTimeInterval);
				self.pageTimeInterval = window.setInterval(function(){
					self.elapsedTime+= 5;
					self.track('Time_Expanded_' + self.elapsedTime + 's', true);
					if (self.elapsedTime >= self.timeTrackingEndTime || self.elapsedTime >= 180 || !self.adIsExpanded) {
						window.clearInterval(self.pageTimeInterval);
					}
				}, 5000);
			} else {
				window.clearInterval(self.pageTimeInterval);
				self.timeTrackingEndTime = self.elapsedTime;
			}
		},
		query_string: function(shouldStringify){
			var url = window.location.href;
			if(url.indexOf('?') !== -1){
				var urlObj = {};
				var params = url.split('?')[1].split('&');
				for(var i=0; i<params.length; i++){
					var result = params[i].split('=');
					urlObj[decodeURIComponent(result[0])] = decodeURIComponent(result[1]);
				}
				if(shouldStringify){
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
			if (round !== 0){
				roundTo = Math.pow(10, round);
			}
			return Math.round(num*roundTo)/roundTo;
		},
		// TODO: add error handling
		loadAsync: function(scripts, callback) {
			if (scripts.length <= 0) { return callback(); }

			var loadCount = 0;
			scripts.forEach(function(src){
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.async = true;
				script.onload = script.onerror = function(){
				  if (++loadCount === scripts.length) { callback(); }
				};
				script.src = src;
				document.getElementsByTagName('head')[0].appendChild(script);
			});
		},
		track: function(name, isAutoFired){
			this.dojo_track({
				'type': 'interactions',
				'key': name,
			}, isAutoFired);
		},
		dojo_track: function(vars, isAutoFired){  // If tracking is auto-fired (not user initiated), don't extend timer
			if (!isAutoFired) { this.pageTime(true); }

			if (!this.isDojo) { this.log(vars.key); }
			else {
				var url = this.dojoUrl+'rmstat?pl='+this.pl+'&adunit='+this.unitID+'&type='+encodeURIComponent(vars.type)+'&key='+encodeURIComponent(vars.key)+'&time='+Date.now();
				if (typeof global_ad_id1[0] !== 'undefined') {
					var g_ad = global_ad_id1[0];
					if (g_ad.user_prefs) { url += '&user_prefs=' + g_ad.user_prefs; }
					if (g_ad.idfa) { url += '&idfa=' + g_ad.idfa; }
					if (g_ad.location.lat) { url += '&lat=' + g_ad.location.lat; }
					if (g_ad.location.lng) { url += '&long=' + g_ad.location.lng; }
				}
				this.image_tracker(url);
			}
		},
		valid_email: function(email){
	        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	        return filter.test(email);
	    },
		valid_geo: function(geoTest){
			try {
				geoTest = geoTest.split(',');
				if (geoTest.length === 2) {
					return (parseFloat(geoTest[0]) >= -90 &&
						      parseFloat(geoTest[0]) <= 90 &&
								  parseFloat(geoTest[1]) >= -180 &&
								  parseFloat(geoTest[1]) <= 180) &&
									/^\-?[0-9]*\.?[0-9]*$/.test(geoTest[0].replace(' ','')) &&
									/^\-?[0-9]*\.?[0-9]*$/.test(geoTest[1].replace(' ',''));

				} else {
					return false;
				}
			} catch(e) {
				return false;
			}
		},
		valid_phone: function(phone_num){
		    if(phone_num){
		    	phone_num = phone_num.replace(/[^0-9]/g, '');
				return /^\d{10}/.test(phone_num);
		    }
		},
		valid_zip: function(zip){
       return /^\d{5}(-\d{4})?$/.test(zip);
    },

    // Add trackers to video, autoplay on expand (if desired)
    // Can pass in video element or video element id, or nothing if only a single video element exists on page
		video: function(videoEl, shouldPlayOnExpand){
			var self = this;

			if (videoEl && typeof videoEl === "string") { // passed as ID
				self.videoElement = document.getElementById(videoEl);
			} else if (!videoEl) { // not passed
				self.videoElement = document.getElementsByTagName("video")[0];
			} else { // passed as video element
				self.videoElement = videoEl;
			}

			self.videoElement.shouldPlayOnExpand = !!shouldPlayOnExpand;

      self.videoElement.addEventListener('play', function() {
	      self.dojo_track({'type': 'video', 'key': 'play'});
      });

      self.videoElement.addEventListener('pause', function(){
        if (!self.videoElement.ended) {
          self.dojo_track({'type': 'video', 'key': 'pause'});
        }
      });

      var quartiles = {'25': false, '50': false, '75': false};

      self.videoElement.addEventListener('timeupdate', function(){
        var check = self.roundIt(((self.videoElement.currentTime/self.videoElement.duration)*100), 0);
        for (var q in quartiles){
          if(check >= q && !quartiles[q]){
            self.dojo_track({ 'type': 'video', 'key': 'quartile'+q }, true);
            quartiles[q] = true;
          }
        }
      });

      var hasEnded = false;
      self.videoElement.addEventListener('ended', function() {
      	if (!hasEnded) {
      		hasEnded = true;
        	self.dojo_track({'type': 'video', 'key': 'complete'}, true);
        }
      });
      self.videoElement.addEventListener("seeked", function() {
	      dojo.dojo_track({ 'type': 'video', 'key' : 'seek' });
	    });

      var videoIsMuted = self.videoElement.muted;
      self.videoElement.addEventListener('volumechange', function() {
        if(!videoIsMuted && (self.videoElement.muted || self.videoElement.volume === 0.0)) {
          self.dojo_track({'type': 'video', 'key': 'muted'});
          videoIsMuted = true;
        } else if (videoIsMuted && !self.videoElement.muted && self.videoElement.volume > 0.0) {
          self.dojo_track({'type': 'video', 'key': 'unmuted'});
          videoIsMuted = false;
        }
      });

      return self.videoElement;
    },

		xmlToObject: function(xml, parse) {
			if(parse){
				var parser = new DOMParser();
				xml = parser.parseFromString(xml,"text/xml");
			}
			var obj = {};
			if (xml.nodeType === 1) {
				if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType === 3) {
				obj = xml.nodeValue;
			}
			if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) === "undefined") {
						obj[nodeName] = this.xmlToObject(item, false);
					} else {
						if (typeof(obj[nodeName].push) === "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(this.xmlToObject(item, false));
					}
				}
			}
			return obj;
		},
	};
	dojo.iosVersion = dojo.iosVersionCheck();
	if(typeof(global_ad_id1) !== 'undefined'){
    dojo.isDojo = true;
		var newUrl = global_ad_id1[0].url.split('?');
		var metricsArray = newUrl[1].split('&');
		var metrics = {};
		for(var i=0; i<metricsArray.length; i++){
		  var metricParams = metricsArray[i].split('=');
      try {
		    metrics[metricParams[0]] = decodeURIComponent(metricParams[1]);
      } catch(e) { console.log(e); }
		}
		dojo.unitID = metrics.ad_id;
		var scripts = document.getElementsByTagName('script');
		for (var k = 0; k < scripts.length; k++){
		  var scriptSrc = scripts[k].src;
		  if(scriptSrc.indexOf('dojo.phluant.com') !== -1){
		    scriptSrc = scriptSrc.replace(/https?\:\/\/(staging\.)?dojo\.phluant\.com\/adj\//, '');
		    scriptSrc = scriptSrc.split('/');
		    dojo.pl = scriptSrc[0];
		    break;
		  }
		}
		dojo.dojoUrl = global_ad_id1[0].url.substring(0,global_ad_id1[0].url.indexOf("dojo.phluant.com") + 17);
	}

	function isIframe() {
	    try { return window.self !== window.top; }
	    catch (e) { return true; }
	}

	function getThisFrameEl(){
		var frameEl = null; // TODO: catch security error when parent is different domain
		var i=0, iframes = window.parent.document.getElementsByTagName('iframe');
		while ((frameEl = iframes[i++])) {
			if (frameEl.contentWindow === window) { break; }
		}
		return frameEl;
	}

	// TODO: make sure this is ok to do before onload
	if (isIframe()) { dojo.iframeEl = getThisFrameEl(); }

	if (document.readyState === 'complete') { dojo.winLoaded = true; }

	/* 	adding an event listener for 'load' doesn't
		work with multiple ads in the same mraid webview */

	/* else window.addEventListener('load', onLoad, false); */

	document.addEventListener('readystatechange', function(){
	    if (document.readyState === 'complete') { dojo.winLoaded = true; }
	    /* TODO: maybe remove event listener */
	}, false);
})();
