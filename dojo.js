/*Dojo.js Framework v0.3.2 | (c) 2014 Phluant, Inc. All rights Reserved | See documentation for more details*/
(function(){
	window.dojo = {
		version: '0.3.2',
		adInit: null,
		adIsExpanded: false, /* TODO:  remove this stupid property */
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
		winLoaded: false,
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
		videoInt: null,
		pl: null,
		unitID: null,
		webServiceUrl: 'http://lbs.phluant.com:8080/',
		dojoUrl: 'http://dojo.phluant.com/',

		iframeEl: null,
		iframeContractSize: {},

		lastInteractionTime: 0,
		pageTimeInterval: undefined,
		elapsedTime: 0,

		ajax: function(vars){
			ajaxRequest = new XMLHttpRequest();
			var sendData = '';
			var yql = false;
			var asynch = true;
			var self = this;
			if(typeof(vars.asynch) == 'boolean'){
				asynch = vars.asynch;
			}
			if(typeof(vars.yql) != 'undefined'){
				yql = true;
			}
			if(typeof(vars.data) != 'undefined'){
				for(var i in vars.data){
					sendData += ((sendData != '')?'&':'')+i+'='+encodeURIComponent(vars.data[i]);
				}
			}
			if((vars.method != 'POST' || yql) && sendData != ''){
				vars.url += ((vars.url.indexOf('?') != -1)?'&':'?')+sendData;
			}
			var timeout = 10000;
			if(typeof(vars.timeout) == 'number'){
				timeout = vars.timeout;
			}
			if(yql){
				var format = ((typeof(vars.yql.format) == 'string')? vars.yql.format : 'json');
				var yql = 'format='+format+'&q='+encodeURIComponent('select * from '+format+' where url="' +vars.url+ '"');
				vars.url = 'http://query.yahooapis.com/v1/public/yql';
				if(vars.method != 'POST'){
					vars.url += '?'+yql;
				}
				else{
					sendData = yql;
				}
			}
			ajaxRequest.open(vars.method, vars.url, asynch);
			if(vars.method == 'POST'){
				ajaxRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");
				ajaxRequest.send(sendData);
			}
			else{
				ajaxRequest.send();
			}
			if(typeof(vars.callback) != 'undefined'){
				var ajaxTimeout = setTimeout(function(){
					ajaxRequest.abort();
					vars.callback({
						'status': 'error',
						'reason': 'timeout',
					});
				},timeout);
				ajaxRequest.onreadystatechange = function(){
					if (ajaxRequest.readyState == 4 && ajaxRequest.status == 200) {
						clearTimeout(ajaxTimeout);
						var resp = ajaxRequest.responseText;
						if(typeof(vars.js_object) != 'undefined'){
							if(vars.js_object){
								resp = ajaxRequest.getResponseHeader("Content-Type").indexOf('xml') != -1 ? self.xmlToObject(resp, true): JSON.parse(resp);
							}
						}
						if(yql){
							resp = {
								'status': 'success',
								'results': resp,
							};
						}
						vars.callback(resp);
					}
					else if(ajaxRequest.status != 200){
						clearTimeout(ajaxTimeout);
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

			if (vars.prepend) vars.url = vars.prepend + encodeURIComponent(vars.url);
			console.log('opening ' + vars.url);
			this.pageTime(false);
			window.open(vars.url, '_blank');
		},
		contract: function(){
			if (!this.adIsExpanded) return;

			if (this.videoPlaying) this.video_close();
			if (this.iframeEl) {
				this.iframeEl.style.width = this.iframeContractSize.x + 'px';
				this.iframeEl.style.height = this.iframeContractSize.y + 'px';
			}
			if (this.isMraid) mraid.close();

			this.track('contract');
			this.adIsExpanded = false;
			this.pageTime(false);
			if (this.closeCallback) this.closeCallback();
		},
		expand: function(width,height){
			if (this.adIsExpanded) return;

			if (typeof(width) === 'number') width += 'px';
			if (typeof(height) === 'number') height += 'px';

			if (this.iframeEl) {
				this.iframeContractSize.x = this.iframeEl.offsetWidth;
				this.iframeContractSize.y = this.iframeEl.offsetHeight;

				if (width) this.iframeEl.style.width = width;
				if (height) this.iframeEl.style.height = height;
			}
			if (this.isMraid) mraid.expand();

			this.track('expand');
			this.adIsExpanded = true;
			this.pageTime(true);
		},
		geolocation: function(vars){
			console.log(vars);
			var varsExport = {
				'url': this.webServiceUrl+'geolocation/export',
				'method': 'GET',
				'callback': vars.callback,
				'js_object': true,
			};
			if(typeof(vars.data) != 'undefined'){
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
		    	if (resolved) return;
		    	else resolved = true;

				vars.callback({
					'lat': position.coords.latitude,
					'lng': position.coords.longitude
				});
	    	}

	    	function error(e){
	    		if (resolved) return;
	    		else resolved = true;

	    		/* TODO: normalize return data to be the
	        	 same as above, to maintain consistency */
	        	if (vars.failover) dojo.geolocation(vars);
	        	else vars.callback(false);
	        }

		    setTimeout(error, 8000);
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
			if (vars.map_id === undefined)
		    	return console.log('A map id must be specified');
			if (typeof(vars.map_id) === 'string') vars.map_id = this.gid(vars.map_id);

		    var map = new google.maps.Map(vars.map_id, {
		    	zoom: vars.map_zoom,
		        center: new google.maps.LatLng(vars.center_lat, vars.center_lng),
		        disableDefaultUI: true,
		        mapTypeId: google.maps.MapTypeId.ROADMAP
		    });

		    var bounds = new google.maps.LatLngBounds();
		    if (vars.markers) vars.markers.forEach(function(marker){
		        marker.position = new google.maps.LatLng(marker.lat, marker.lng);
		        marker.map = map;

		        var gMarker = new google.maps.Marker(marker);

		        if (marker.clickthru) google.maps.event.addListener(gMarker, 'click', function(){
					if (marker.clickthru.callback) marker.clickthru.callback.call(this);
					if (!marker.clickthru.url) marker.clickthru.url = 'https://maps.google.com/?saddr='+ vars.user_lat +','+ vars.user_lng +'&daddr='+ this.position.lat() +','+ this.position.lng();
	            	dojo.clickthru(marker.clickthru);
		        });

		        if (marker.events) for (var event in marker.events)
			    	google.maps.event.addListener(gMarker, event, marker.events[event]);

		        bounds.extend(gMarker.position);
		    });
		    if (vars.map_zoom === undefined) map.fitBounds(bounds);
		},
		/* TODO: remove the fallback callback and normalifze the return data for callback */
		gmaps_geo: function(vars){
			if (!vars.callback) return false;
			if (!vars.loc_type) vars.loc_type = 'address';
			if (!this.geocoder) this.geocoder = new google.maps.Geocoder();

			var opts = {};
			if (['geo','latLng'].indexOf(vars.loc_type) !== -1) {
				if (!this.valid_geo(vars.address))
					return console.error('invalid lat/lng');

				var coords = vars.address.split(',');
				opts.latLng = new google.maps.LatLng(coords[0], coords[1]);
			}
			else opts.address = encodeURIComponent(vars.address);

			this.geocoder.geocode(opts, function(results, status) {
				dojo.gmaps_return(results, status, vars);
			});
		},
		gmaps_return: function(results, status, vars){
			if (status === google.maps.GeocoderStatus.OK) return vars.callback(results);
			else if (vars.failover) {
				var opts = {
					data: {value: vars.address},
					callback: vars.failover_callback || vars.callback,
				};

				/* TODO: don't wait until after the network request to do this check.
				   Also, shouldn't this be done inside the geolocation function? */
				if (this.valid_zip(vars.address)) opts.data.type =  'postal_code';
				else if (this.valid_geo(vars.address)) opts.data.type =  'city_postal_by_geo';
				else return console.error('invalid address');

				this.geolocation(opts);
			}
			else vars.callback(false);
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
					if (self.iframeEl) {
						self.iframeContractSize.x = self.iframeEl.offsetWidth;
						self.iframeContractSize.y = self.iframeEl.offsetHeight;
					}
				}
			}
			if(typeof(mraid) != "undefined"){
			    this.isMraid = true;
			    /* TODO: don't assume custom close */
			    /* TODO: don't use mraid until it's ready */
			    mraid.setExpandProperties({useCustomClose:true});
			    mraid.addEventListener('stateChange', function(){
			    	/* TODO: actually check the state INSTEAD */
			        if(self.adIsExpanded){
			        	if(self.closeCallback) self.closeCallback();
			            self.adIsExpanded = false;
			        }
			    });
			    var tag_elem = document.body;
			    if(typeof(vars.tag_elem) != 'undefined'){
			    	tag_elem = vars.tag_elem;
			    	if(typeof(tag_elem) == 'string'){
			    		tag_elem = this.gid(tag_elem);
			    	}
			    }
			    document.body.style.margin="0px";
			    tag_elem.style.position="absolute";
			    var newMetaTag = document.createElement('meta');
			    newMetaTag.name = "viewport";
			    newMetaTag.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
			    document.getElementsByTagName('head')[0].appendChild( newMetaTag );
			}
			if(typeof(vars.asynch_load) != 'undefined'){
				var scripts = vars.asynch_load.scripts;
				var insert_before = vars.asynch_load.insert_before;
				var max = scripts.length;
				var sCount = 0;
				if(typeof(insert_before) == 'string') insert_before = this.gid(insert_before);
				var insertParent = insert_before.parentNode;
				for(var s=0; s<scripts.length; s++){
				  var newScript = document.createElement('script');
				  newScript.src = scripts[s];
				  insertParent.insertBefore(newScript, insert_before);
				  newScript.onload = function(){
				    sCount++;
				    if(sCount == max){
				      self.init_check();
				    }
				  }
				}
			}
			else{
				this.init_check();
			}
		},
		init_check: function(){
			if(this.adInit != null){
				if(this.isMraid){
					if(mraid.getState() === 'loading'){
						mraid.addEventListener('ready', this.mraid_ready);
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
		/* TODO: make sure both the DOM and mraid is ready before init */
		mraid_ready: function(){
			if(mraid.isViewable()) dojo.mraid_view_change();
			else mraid.addEventListener('viewableChange', dojo.mraid_view_change);
		},
		mraid_view_change: function(){
			if (mraid.isViewable()) { /*TODO: don't check isViewable again*/
				if (!dojo.winLoaded) { /*Mraid doesn't fire the load event,*/
					dojo.winLoaded = true;  /*so we have to do it manually*/

				    try { window.dispatchEvent(new Event('load')); }
				    catch(e) { /* depecrated event construction method */
				    	var loadEvent = document.createEvent('Event');
				        loadEvent.initEvent('load', true, true);
				        window.dispatchEvent(loadEvent);
				    }
				}
				dojo.track('viewableChange');
				setTimeout(dojo.adInit.bind(dojo)); /*delay init until after load callbacks are fired*/
				mraid.removeEventListener('viewableChange', dojo.mraid_view_change);
			}
		},
		pageTime: function(shouldStart) { // true will start the timer, false will stop it
			var self = this;
			if (shouldStart) {
				self.elapsedTime = 0;
				self.lastInteractionTime = 0;
				self.pageTimeInterval = window.setInterval(function(){
					self.elapsedTime+= 5;
					if (self.elapsedTime - self.lastInteractionTime <= 60) {
						self.track('time elapsed ' + self.elapsedTime + 's');
					}
				}, 5000);
			} else {
				window.clearInterval(self.pageTimeInterval);
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
		shoplocal: function(vars){
			var settings = {
				storeid: null,
				listingcount: 50,
				resultset: 'full',
				sortby: 6,
				listingimagewidth: 60,
			};
			for(var s in settings){
				if(typeof(vars.data[s]) != 'undefined'){
					settings[s] = vars.data[s];
				}
			}
			var callType = null;
			var returnData = {};
			var self = this;
			if(typeof(vars.data.call_type) != 'undefined'){
				callType = vars.data.call_type.split(',');
				for(var i=0; i<callType.length; i++){
					if(callType[i] != 'store'){
						if(typeof(vars.data[callType[i]+'ids']) == 'undefined'){
							console.error('data.'+callType[i]+'ids must be defined for the respective lookup.');
							return false;
						}
						else{
							returnData[callType[i]] = {};
							var tags = vars.data[callType[i]+'ids'].split(',');
							for(var t=0; t<tags.length; t++){
								returnData[callType[i]][tags[t]] = null;
							}
						}
					}
				}
			}
			var req = ['company', 'campaignid'];
			for(var i=0; i<req.length; i++){
				if(typeof(vars.data[req[i]]) == 'undefined'){
					console.error('data.'+req[i]+' is a required attribute for the shoplocal function.');
					return false;
				}
			}
			var citystatezip = null;
			var geoCall = {
				callback: geoCallback,
			};
			if(typeof(vars.data.location) != 'undefined'){
				if(pcf.valid_zip(vars.data.location)){
					citystatezip = vars.data.location;
					determineStep();
				}
				else if(pcf.valid_geo(vars.data.location)){
					geoCall.data = {
						type: 'city_postal_by_geo',
						value: vars.data.location
					};
				}
				else{
					console.error('Invalid location format.  Must be either a US postal code or lat/lng coordinates.  See documentation for more details.');
					return false;
				}
			}
			else{
				pcf.geolocation(geoCall);
			}
			function determineStep(){
				if(settings.storeid == null){
					fetchStore();
				}
				else if(callType != null){
					var proceed = true;
					for(var i=0; i<callType.length; i++){
						for(var t in returnData[callType[i]]){
							if(returnData[callType[i]][t] == null){
								fetchCall(callType[i], t);
								proceed = false;
								break;
							}
						}
					}
					if(proceed){
						returnInfo();
					}
				}
				else{
					returnInfo();
				}
			}
			function fetchStore(){
				var storeInfo = {
					url: 'http://api.shoplocal.com/'+vars.data.company+'/2012.1/xml/getstores.aspx?campaignid='+vars.data.campaignid+'&citystatezip='+citystatezip,
					method: 'GET',
					yql: {
						format: 'xml',
					},
					callback: function(d){
						if(d.status != 'error'){
							var data = self.xmlToObject(d.results, true);
							var storeData = data.query.results.content;
							var stores = storeData.collection.data;
							settings.storeid = null;
							for(var i in stores){
								var grab = true;
								if(typeof(vars.data.name_flag) != 'undefined' && stores[i]['@attributes'].name.indexOf(vars.data.name_flag) != -1){
									grab = false;
								}
								if(stores[i]['@attributes'].contentflag != 'Y'){
									grab = false;
								}
								if(grab && settings.storeid == null){
									settings.storeid = stores[i]['@attributes'].storeid;
								}
								if(!grab){
									delete storeData.collection.data[i];
								}
							}
							returnData.stores = {
								status: 'success',
								shoplocal_url: this.url,
								results: storeData,
							}
							determineStep();
						}
					},
				}
				if(typeof(vars.data.pd) != 'undefined'){
					storeInfo.url += '&pd='+vars.data.pd;
				}
				pcf.ajax(storeInfo);
			}
			function fetchCall(callType, treeId){
					var callInfo = {
						url: 'http://api.shoplocal.com/target/2012.2/xml/get'+callType+'listings.aspx?campaignid='+vars.data.campaignid+'&'+callType+'ids='+treeId,
						method: 'GET',
						yql: {
							format: 'xml',
						},
						callback: function(d){
							if(d.status != 'error'){
								var data = self.xmlToObject(d.results, true);
								returnData[callType][treeId] = {
									status: 'success',
									shoplocal_url: this.url,
									results: data.query.results.content,
								};
								determineStep();
							}
						},
					};
					for(var s in settings){
						callInfo.url += '&'+s+'='+settings[s];
					}
					if(typeof(vars.data.pd) != 'undefined'){
						callInfo.url += '&pd='+vars.data.pd;
					}
					pcf.ajax(callInfo);
			}
			function geoCallback(d){
				if(d.status == 'success'){
					returnData.user_info = d.results;
					citystatezip = d.results.postal_code;
					determineStep();
				}
			}
			function returnInfo(){
				vars.callback(returnData);
			}
		},
		track: function(name){
			this.dojo_track({
				'type': 'interactions',
				'key': name,
			});
		},
		dojo_track: function(vars){
			if (vars.key && vars.key.indexOf("time elapsed") === -1) {
				this.lastInteractionTime = this.elapsedTime; //Assume a tracking event is an interaction
			}
			if (!this.isDojo || this.dojoConsoleLog){
				console.log(vars.key);
			}
			if (this.isDojo){
				var url = this.dojoUrl+'rmstat?pl='+this.pl+'&adunit='+this.unitID+'&type='+vars.type+'&key='+vars.key+'&time='+new Date().getTime();
				this.image_tracker(url);
			}
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
			objCheck = ['style', 'attributes'];
			if(!this.video_properties.reload && !this.vidContainer){
				for(var i in vars){
					if(objCheck.indexOf(i) != -1){
						for(var v in vars[i]){ this.video_properties[i][v] = vars[i][v]; }
					}
					else { this.video_properties[i] = vars[i]; }
				}
			}
			if (vars) this.vidContainer = vars.container_id;
			if(typeof(this.vidContainer) == 'string'){
				this.vidContainer = this.gid(this.vidContainer);
			}

			if(this.video_properties.full_screen){
				this.video_properties.attributes['webkit-playsinline'] = false;
			}

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
			dojo_videoElement = document.createElement("video");
			dojo_videoElement.src = this.video_properties.video_url;
			for(var attr in this.video_properties.attributes){
				if (this.video_properties.attributes[attr] === true)
					dojo_videoElement.setAttribute(attr, '');
				else if (this.video_properties.attributes[attr] !== false)
					dojo_videoElement.setAttribute(attr, this.video_properties.attributes[attr]);
			}
			for(var i in this.video_properties.style){
				dojo_videoElement.style[i] = this.video_properties.style[i];
			}
			dojo_videoElement.addEventListener('canplaythrough', function(){
				if(self.video_properties.attributes.autoplay === true){
					dojo_videoElement.play();
				}
			});
			this.vidContainer.appendChild(dojo_videoElement);
			dojo_videoElement.load();

			dojo_videoElement.addEventListener('play', function(){
				self.dojo_track({
					'type': 'video',
					'key': 'play'
				});

				if(self.video_properties.full_screen){
					self.video_full_screen(dojo_videoElement);
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

	  			dojo_videoElement.addEventListener('timeupdate', function(e){
		  			if (dojo_videoElement.currentTime) self.video_position = dojo_videoElement.currentTime;
		  			var check = self.roundIt(((dojo_videoElement.currentTime/duration)*100), 0);
		  			for(var q in quartiles){
		  				if(check >= q && !quartiles[q]){
		  					self.dojo_track({
								'type': 'video',
								'key': 'quartile'+q
							});
							var quartEvent = new Event('quartile'+q);
							dojo_videoElement.dispatchEvent(quartEvent);
							quartiles[q] = true;
						}
		  			}
		  		},100);
			});

			if(!this.video_properties.full_screen){
				dojo_videoElement.addEventListener('ended', function(){
					self.video_position = 0;
	        self.video_close();
			  });
			}
			var videoIsMuted = false;

		  dojo_videoElement.addEventListener('volumechange', function() {
				if(!videoIsMuted && (dojo_videoElement.muted || dojo_videoElement.volume === 0.0)) {
					var muteEvent = new Event('muted');
					dojo_videoElement.dispatchEvent(muteEvent);
					videoIsMuted = true;
				} else if (videoIsMuted && !dojo_videoElement.muted && dojo_videoElement.volume > 0.0) {
					var unmuteEvent = new Event('unmuted');
					dojo_videoElement.dispatchEvent(unmuteEvent);
					videoIsMuted = false;
				}
		  });
		  return dojo_videoElement;
		},
		video_close: function(){
			var self = this;
			var videoCloseEvent = new CustomEvent('videoClose', { 'detail': {'duration': self.video_position }});
			dojo_videoElement.dispatchEvent(videoCloseEvent);
			this.vidContainer.removeChild(dojo_videoElement); // innerHTML = '';
			this.videoPlaying = false;
			clearInterval(this.videoInt);

			if (!self.video_position) {
				self.dojo_track({
					'type': 'video',
					'key': 'videoComplete'
				});
			}
			this.dojo_track({
				'type': 'video',
				'key': 'close'
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
				self.video_position = 0;
		    self.video_close();
			});
		},
		xmlToObject: function(xml, parse) {
			if(parse){
				var parser = new DOMParser();
				xml = parser.parseFromString(xml,"text/xml");
			}
			var obj = {};
			if (xml.nodeType == 1) {
				if (xml.attributes.length > 0) {
				obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) {
				obj = xml.nodeValue;
			}
			if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) == "undefined") {
						obj[nodeName] = this.xmlToObject(item, false);
					} else {
						if (typeof(obj[nodeName].push) == "undefined") {
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
	}
	dojo.iosVersion = dojo.iosVersionCheck();
	if(typeof(global_ad_id1) != 'undefined'){
		var newUrl = global_ad_id1[0].url.split('?');
		var metricsArray = newUrl[1].split('&');
		var metrics = {};
		for(var i=0; i<metricsArray.length; i++){
		  var metricParams = metricsArray[i].split('=');
		  metrics[metricParams[0]] = decodeURIComponent(metricParams[1]);
		}
		dojo.unitID = metrics.ad_id;
		var scripts = document.getElementsByTagName('script');
		for(var i=0; i<scripts.length; i++){
		  var scriptSrc = scripts[i].src;
		  if(scriptSrc.indexOf('dojo.phluant.com') != -1){
		    scriptSrc = scriptSrc.replace('http://dojo.phluant.com/adj/', '');
		    scriptSrc = scriptSrc.split('/');
		    dojo.pl = scriptSrc[0];
		    break;
		  }
		}
		dojo.isDojo = true;
	}

	function isIframe() {
	    try { return window.self !== window.top; }
	    catch (e) { return true; }
	}

	function getThisFrameEl(){
		var frameEl = null; // TODO: catch security error when parent is different domain
		var i=0, iframes = window.parent.document.getElementsByTagName('iframe');
		while (frameEl = iframes[i++])
			if (frameEl.contentWindow === window) break;
		return frameEl;
	}

	// TODO: make sure this is ok to do before onload
	if (isIframe()) dojo.iframeEl = getThisFrameEl();

	if (document.readyState === 'complete') dojo.winLoaded = true;

	/* 	adding an event listener for 'load' doesn't
		work with multiple ads in the same mraid webview */

	/* else window.addEventListener('load', onLoad, false); */

	document.addEventListener('readystatechange', function(){
	    if (document.readyState === 'complete') dojo.winLoaded = true;
	    /* TODO: maybe remove event listener */
	}, false);
})();
