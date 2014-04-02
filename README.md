# Dojo Framework Library

The Dojo Framework (dojo) Libaray is a framework for use by Phluant Mobile's clients in developing their rich media campaign assets.  The concept of the framework is to provide our clients with a code base thiat works both inside and outside of our ad serving network, which will substantially reduce the amount of time needed to launch a rich media campaign.  It also provides a number of core features that are very common in the rich media campaigns we run.  It is written in pure JavaScript, so all core features will work independently of jQuery or any other JavaScript framework library.  Some features may require supporting libraries (i.e. Google Maps) and will be indicated as such in the documentation.  The feature list is below.  

* [Element ID referencing](#element-id-referencing)
* [Initialization](#initialization)
* [Automatic MRAID detection and handling](#initialization)
* [Expands](#expands)
* [Contracts](#contracts)
* [Clickthroughs](#clickthroughs)
* [Custom trackers](#custom-trackers)
* [HTML5 video](#html5-video)
* [All geolocation and weather API calls to Phluant's resources](#geolocationweather-api-calls)
	* [Geolocation](#geolocation)
	* [Weather](#weather)
* [HTML5 geolocation prompt with optional IP lookup as a fallback](#geolocation-prompt)
* [Store locator API call](#store-locator-api-call)
* [Shoplocal API call](#shoplocal-api-call)
* [Google Maps](#google-maps)
	* [Geocoding](#geocoding)
	* [Map Draw](#map-draw)
* [Standard AJAX Requests](#standard-ajax-requests)
* [Image Tracker](#image-tracker)
* [Mobile and platform specific detection](#)
* [iOS version detection (namely for iOS 7)](#ios-version-detection)
* [Query string detection](#query-sring-detection)
* [String Capitalization](#string-capitalization)
* [Email Validation](#email-validation)
* [Phone Number Validation](#phone-number-validation)
* [Zip Code Validation](#zip-code-validation)
* [Technical Support](#technical-support)

---

## How To Use

Place the JavaScript tag referencing the frameowrk before any campaign specific code.  You may do this either in the head or inline.  We recommend you use the minified version for any non-development work.  For your convenience, we have a copy of the code on our CDN server you may use at http://mdn4.phluantmobile.net/jslib/dojo.js/.  Example tag:

```
<script src="http://mdn4.phluantmobile.net/jslib/dojo.js/dojo.min.js"></script>
```

All coding examples used in this documentaiton can utilize jQuery or other JavaScript framework library equivalents unless otherwise indicated.

[top](#dojo-framework-library)

---

### Element ID referencing

The ads we serve up can be placed on a web site or mobile applicaiton with multiple ad instances.  This function ensures any element ID referenced in the code will have the namespacing attribute added to it if needed, with the standard ```document.getElementById()``` function being the fallback.

Example:

```
<script>
var contract_div = dojo.gid('contract_div');
var expand_div = dojo.gid('expand_div');
var expand_btn = dojo.gid('expand_btn');
var close_btn = dojo.gid('close_btn');
</script>
```

_Required for any campaign that will have multiple ad instances served, and is recommended in all other cases.  It's compatible when being used with jQuery or other JavaScript framework libraries._

[top](#dojo-framework-library)

---

### Initialization

This function initializes the framework for expandable ads and interstitial/banner ads that need close functionalty.  It also initializes any MRAID specific functionality if the MRAID framework is detected.  The developer will need to ensure an appropriate callback function is designated for contracting/closing the ad.  If the callback function contains object function calls, the object must have an explicit reference.

Specs:

* callback: The close function for an expanded ad.  Required for any expandable ad running on MRAID.  Recommended in all cases.
* init: The initialization function for an ad.  Required for any ad running on MRAID.  Recommended in all cases.
* expanded: Default is false.  Only required for interstitial ads.

Example:

```
<script>
function contractAd(){
	expand_div.style.display = 'none';
	contract_div.style.display = 'block';
}

function initialize(){
	//Initialization code.
}

//Including the expand attribute is optional for expandable ads starting out in the contracted state.  For interstitial/banner ads, set the attribute to true.  Including the callback attribute is optional for interstitial and banner ads not requiring close functionality.
dojo.init({
	'callback': contractAd,
	'expanded': false,
	'init': initialize
});
</script>
```

_Required for all expandable ads, interstitial/banner ads that need close funcitonality, and any ad that will run in MRAID._

[top](#dojo-framework-library)

---

### Expands

This function receives the attributes of the ad in its expanded state, fires off the appropriate reporting tracker, and automatically handles any MRAID specific requirements.  For assets running outside of our ad serving network, a console log message will display the expansion properties.

Example:

```
<script>
expand_btn.addEventListener('click', function(){
	expand_div.style.display = 'block';
	contract_div.style.display = 'none';
	dojo.expand({
		'width': 320,
		'height': 416
	});
}
</script>
```

_Required for all expandable ads._

[top](#dojo-framework-library)

---

### Contracts

This funciton ensures our framework can properly close the ad, fires off the appropriate reporting tracker, automatically handle and MRAID specific requirements, and closes any video being played.  For assets running ourside of our ad serving network, a console log message will outputted indicating 'contracting'.  Because the ad specific close function was already passed to the framework with the initialization, it's only necessary to call the framework function.

Example:

```
<script>
contract_btn.addEventListener('click', function(){
	dojo.contract();
});
</script>
```

_Requried for all expandable ads as well as interstitial/banner ads that require close functionality._

[top](#dojo-framework-library)

---

### Clickthroughs

This function ensures any user initiated clickthrough can be entered into our tracking system, and will open either a new browser tab (mobile web) or the mobile app's web viewer.  For assets running outside of our ad serving network, a console log message displaying the reporting name will be outputted.

Example of traditional hyperlink using the element ID as the reporting name:

```
<a id="clickthrough1" href="http://somesite.com">Clickthrough 1</a><br />
<a id="clickthrough2" href="http://othersite.com">Clickthrough 2</a>
<script>
var links = document.getElementsByTagName("a");
for (var i=0; i<links.length; i++){
    links[i].addEventListener("click", function (a){ 
    	a.preventDefault();
    	dojo.clickthru({
    		'url': links[i].href,
    		'name': links[i].id
    	});
    });
}
</script>
```

Example of using an element as a 'hotspot':

```
<div id="clickthrough"></div>
<script>
var clickthrough = dojo.gid('clickthrough');
clickthrough.addEventListener('click', function(){
	dojo.clickthru({
		'url': 'http://somesite.com',
		'name': 'clickthrough',
	});
});
</script>
```
_Required for all clickthroughs that are to be tracked, recommended in all other cases._

[top](#dojo-framework-library)

---

### Custom Trackers

This function ensures that a specialized event can be entered into our tracking system, i.e. a user navigating to a certain section of the ad.  For assets running outside of our ad serving network, a console log message displaying the reporting name will be outputted.

Example: 

```
<ul>
	<li id="section1">Seciton 1</li>
	<li id="section2">Section 2</li>
</ul>
<div id="element1">
	Some content
</div>
<div id="element2">
	More content
</div>

<script>
var section1 = dojo.gid('section1');
var section2 = dojo.gid('section2');
var element1 = dojo.gid('element1');
var element2 = dojo.gid('element2');

section1.addEventListener('click', function(){
	element1.style.display = 'block';
	element2.style.display = 'none';
	dojo.track('element1Display');
});

section2.addEventListener('click', function(){
	element2.style.display = 'block';
	element1.style.display = 'none';
	dojo.track('element2Display');
});
</script>
```

[top](#dojo-framework-library)

---

### HTML5 Video

This function ensures that any HTML5 video that needs to be played can have the proper code rendered, inside or outside of Phluant's ad serving network.  It isn't necessary to include any video tags in the HTML.  All that is needed is a video container element and the proper JavaScript code.  It is also possible for a video to auto play on an expansion.  All that would be required is to add in the function callup to the applicable expand code.  All videos automatically close on the completion of the video or contracting the ad.  For any other events that require closure, ```dojo.video_close()``` can be utlized.

Required Attributes:

* video_url: The URL for the video source.  Can be relative (same server) or absolute (remote server).
* container_id: The DOM element ID for the video centainer.

Optional Attributes:

* attributes.webkit-playsinline: Default is false.  Must be a boolean.  Some devices may not support inline video in certain environments.
* attributes.controls: Default is true.  Most be a boolean.
* attributes.autoplay: Default is true.  Mobile devices will not autoplay a video in a mobile web environment on initial load, but will autoplay on an ad expansion.
* attributes.xx: Any standard HTML5 video attribute can be utilized.
* aspect_ratio: Default is 16:9 and used if height or width of parent element can't be determined.  Can be overwritten.
* close_callback: Default is null.  A function can be specified to call up on the video ending.
* full_screen: Default is false.  Will expand to full screen if set to true on supported devices and will override webkit-playsinline.
* pause_callback: Default is null.  A function can be specified to call up on the video pausing.
* play_callback: Default is null.  A function can be specified to call up on the video ending.
* reload: Default is false.  Phluant's video framework destroys the video instance by default.  Setting reload to true will override this.
* style.xx: Any native JavaScript styling attribute can be utilized.

Additional Notes:

* The video tag will take on the height and width of the parent container by default, so be sure these are set properly!  The default z-index is 5000.  These values can be overwritten, along with any other styling attributes inserted as needed.
* Be sure to utilize the ```dojo.videoPlaying``` boolean if using a click function call, as this will ensure the video isn't called multiple times.

Example:

```
<div id="video_container"></div>
<script>
var video_container = dojo.gid('video_container');
video_container.addEventListener('click', function(){
	if(!dojo.videoPlaying){
		dojo.video({
			'video_url': 'videos/somevideo.mp4',
			'container_id': video_container,
			'aspect_ratio': '16:9',
			'attributes':{
				'controls': true,
				'inline': true
			},
			'style':{
				'zIndex': 50000
			}
		});
	}
});
</script>
```

[top](#dojo-framework-library)

---

### Geolocation/Weather API calls

Phluant maintains a web based application capable of providing geolocation and weather information based on location, using Maxmind and National Weather Service resources respectively.  All lookups are done by AJAX and require the developer to specifiy a callback function to return the data. Please be aware the mobile data providers have a wide latitude in assigning IP addresses to users, which may return an inaccurate location.  If geocoordinates can't be obtained from the publisher and percise geocoordinates are needed, it's recommended to use the [HTML5 Geolocation Prompt](#geolocation-prompt).


#### Geolocation

Geolocation Lookup Methods:

* IP Address (default)
* Postal Code (US and Canadian only)
* City/Postal by Geo

IP Address code example:
```
<script>
function geoReturn(data){
	console.log(data);
}

dojo.geolocation({
	'callback': geoReturn,
});
</script>
```

Postal Code Example:

```
<script>
function geoReturn(data){
	console.log(data);
}

dojo.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'postal_code',
		'value': '98033'
	}
});
</script>
```

City/Postal by Geo Example:

```
<script>
function geoReturn(data){
	console.log(data);
}

dojo.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'city_postal_by_geo',
		'value': '47.6727,-122.1873'
	}
});
</script>
```

All geolocation lookup methods return the following data:

* data.results.country: The abbreviated country.
* data.results.state_region: The abbreviated state, province, or region.
* data.results.city: The full city name.
* data.results.lat: The centralized reported latitude of the postal code.
* data.results.lon: The centralized reported longitude of the postal code.
* data.results.dma_code:  The DMA code for the user’s current location.
* data.results.area_code:  The prevailing area code for the user’s current location.  This has no correlation to the user’s actual area code.

_For a comphrehensive address lookup, please see the [Google Maps Geocoding](#geocoding) function._

#### Weather

Weather Lookup Methods: 

* IP address (default)
* Postal code
* Lat/lng

Weather by IP Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The data.end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.
dojo.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'weather',
		'end': '3 days',
	}
});
</script>
```

Weather by Postal Code Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The data.end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.  The subtype spec must be specified as postal_code.
dojo.geolocation({
	'callback': weatherReturn,
	'data': {
		'type': 'weather',
		'subtype': 'postal_code',
		'value': '98033',
		'end': '3 days'
	}
});
</script>
```

Weather by Geolocation Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The data.end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.  The subtype spec must be specified as geo, and value is in lat,lng format.
dojo.geolocation({
	'callback': weatherReturn,
	'data': {
		'type': 'weather',
		'subtype': 'geo',
		'value': '47.676308399999996,-122.20762579999999',
		'end': '3 days',
	}
});
</script>
```


The weather data returned can vary based on custom input values.  The start_value_time and end_value_time attributes, if included, are in W3C format. An example response is provided below:

* data.status: the overall outcome of the query.  Is success or error.
* data.msg: An occasional message may appear if a particular outcome occurs.
* data.results city: The full city name.
* data.results.state_region: The abbreviated state, province, or region.
* data.results.postal_code: The postal code of the user’s location.
* data.results.lat: The centralized reported latitude of the postal code.
* data.results.lng: The centralized reported longitude of the postal code.
* data.results.nws_xml: The URL for the original NWS XML output.
* data.results.nws_page: The URL for a human friendly NWS weather report page.
* data.results.data.icon:  An array of weather icon images provided by the NWS.  Within each result contains the value, which is a hyperlink to the image, and start_valid_time.
* data.results.data.weather_conditions: An array of the weather conditions summary.  Within reach result contains the value, which is a human readable summary of the weather, and start_valid_time.
* data.results.data.maximum_temp: An array of the maximum daytime temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.results.data.minimum_temp: An array of the minimum daytime temperatures in fahrenheit. Within reach result contains the value, along with start_valid_time and end_valid_time.
* data.results.data.hourly_temp: An array of the hourly temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.results.data.precipitation:  An array of the expected levels of precipitation in inches.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.clould_cover:  An array of the expected cloud cover levels in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.12_hour_precip_prob:  An array of the likeliness of precipitation in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.humidity:  An array of the humidity in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.wind_dir:  An array of the wind directions at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.wind_speed:  An array of the wind speed at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.

[top](#dojo-framework-library)

---

### Store Locator API Call

This function provides certain clients the ability to pull store location information information for various ads, namely to display the closest number of stores in relation to the user.  If your campaign has been set up with this feature, this API call will work for you.  All lookups are done by AJAX and require the developer to specifiy a callback function to return the data.

Lookup Methods: 

* IP address (default)
* Lat/lng

Required Specs:

* callback - the callback function.
* data.campaign_id - the campaign ID assigned by Phluant.


Optional Specs:

* data.limit - the limit on the number of stores.  Default is 3.
* data.dist - the limit on the maximum radius distance in miles.  Default is 30.
* data.value - if using a lat/lng lookup, set as lat,lng.
* data.subtype - specify as geo if using lat/lng values.

Store Location by IP Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values
dojo.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30
	}
});
</script>
```

Store Location by Geo Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values.  Subtype and value must be specified for a geolocaiton lookup.
dojo.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30,
		'subtype': 'geo',
		'value': '47.676308399999996,-122.20762579999999'
	}
});
</script>
```

[top](#dojo-framework-library)

---

### Shoplocal API Call

Becuase Phluant has an established relationship with Shoplocal, we are already set up to aggregate Shoplocal data to our ads. Any Phluant client with an established Shoplocal campaign can utilize this function to call in relevant Shoplocal store and category data.  Store and category data can be looked up all at once or separately.  All lookups are done by AJAX and require the developer to specifiy a callback function to return the data.

Lookup Methods: 

* IP address (default)
* Lat/lng
* Postal Code

Required Specs:

* callback - the callback function.
* data.campaign_id - the campaign ID assigned by Shoplocal.  This is NOT the same campaign ID assigned by Phluant.
* data.company - the company name assigned by Shoplocal.


Optional Specs:

* data.store_limit - The limit on the number of stores.  Default is 1.
* data.cat_limit - The limit on the number of items per category.  Default is 10.
* data.subtype - Specify as geo or postal_code if desired.
* data.value - Set to applicable value if data.suptype is geo or postal_code.
* data.call_type - default is store.  Can be set to category, or store,category to look up both types.
* data.category_tree_id - The item categories.  Only required if the call_type inclues category.  Separate multiple categories with a comma.

Shoplocal by IP Example:

```
<script>
function shoplocalReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.
dojo.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaign_id': 'abc123def456',
		'company': 'ABC, Inc.',
		'store_limit': 3,
		'cat_limit': 5,
		'call_type': 'store,category',
		'category_tree_id': 'houseware,clothing,sports'
	}
});
</script>
```

Shoplocal by Geo Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.  Subtype and value must be specified for a geolocaiton lookup.
dojo.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaign_id': 'abc123def456',
		'company': 'ABC, Inc.',
		'store_limit': 3,
		'cat_limit': 5,
		'call_type': 'store,category',
		'category_tree_id': 'houseware,clothing,sports',
		'subtype': 'geo',
		'value': 'value': '47.676308399999996,-122.20762579999999'
	}
});
</script>
```

Shoplocal by Postal Code Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.  Subtype and value must be specified for a geolocaiton lookup.
dojo.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaign_id': 'abc123def456',
		'company': 'ABC, Inc.',
		'store_limit': 3,
		'cat_limit': 5,
		'call_type': 'store,category',
		'category_tree_id': 'houseware,clothing,sports',
		'subtype': 'postal_code',
		'value': 'value': '98033'
	}
});
</script>
```

*Because Shoplocal return data can vary and this library is still in beta, we will be adding a return data sample at a later date.*.

[top](#dojo-framework-library)

---

### Geolocation Prompt

The funciton provides a means to prompt the user for their geocoordinates.  A callback function must be included to receive the results, which are returned as a JavaScript object if the user approves, or a false boolean if the user declines.  The developer can optionally specify to use the [Geolocation IP lookup](#geolocation) as a failover and specify a failover callback.

Required Specs:
* callback - The callback function.

Optional Specs:
* failover - Set to true for the system to fail over to the Geolocation IP lookup.

Example:
```
<script>

function geoPromptReturn(data){
	console.log(data);
}

//Object attributes are only necessary if the failover feature is desired.
dojo.geolocation_prompt({
	'callback': geoPromptReturn,
	'failover': true,
});

</script>
```

[top](#dojo-framework-library)

---

### Google Maps

The following functions give a simplified method to utilize the Google Maps JavaScript API.  At present, both the geocoding and map drawing functions are supported.  Both features require the Google Maps JavaScript reference placed before the PCF reference, be it in the head or inline.  A callback function is also required. Example Google Maps JavaScript reference:

```
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
```

#### Geocoding

Returns Google Maps API information on a location.  May be a full or partial address, city/state, postal code, lat/lng values, etc. Specifying Phluant's [Geolocation](#geolocation) services as a failover is optional, and the system will detect to use the IP, Postal Code, or Lat/Lng lookup based on address format.  If the failover is not specified and Google doesn't return any data, a false boolean will be returned to the callback.

Required Specs:
* address - Full or partial address, city/state, postal code, lat/lng values, etc.
* callback - The callback funciton.

Optional Specs:
* failover - Default is false.  The system will determine which method to use based on the address qualities.
* failover_callback - If a different callback from the regular failover is desired.  Be aware that if this value isn't specified and failover is set to true, the failover data will be returned to the regular callback function.

Example:

```
<script>

function gmapsReturn(data){
	console.log(data);
}

function geoReturn(data){
	console.log(data);
}

dojo.gmaps_geo({
	'address': '98033',
	'callback': gmapsReturn,
	'failover': true,
	'failover_callback': geoReturn
});
</script>
```

For more information, please visit the about the [Google Maps Geocoder API page](https://developers.google.com/maps/documentation/javascript/geocoding).

_Per Google's API policy, this function is only to be used when populating a Google Map or to create an external clickthrough to Google Maps._

#### Map Draw

Uses relevant data to draw out a Google Map in a specified element.

Required specs:

* map_id - the element ID for the map.
* center_lat - the latitude for the map's central location.
* center_lng - the longitude for the map's central location.

Optional specs:

* map_zoom - the zoom level of the map.  Default is 10.
* markers - an object containing relevant information for any desired markers.
* user_lat - the latitude for the user's location.  Required for the default Google Maps clickthrough.
* user_lat - the longitude for the user's location.  Required for the default Google Maps clickthrough.
	* markers[i].lat - the latitude of the desired marker.  Required for marker to be set.
	* markers[i].lng - the longitude of the desired marker.  Required for marker to be set.
	* markers[i].clickthru - an object containing relevant information for any marker to be a clickthrough.  Default is a Google Maps hyperlink using the original lat/lng values as the start point and the lat/lng values as the end point
		* markers[i].clickthru.name - the name of the clickthru, used for reporting.  Essentially the same functionality as a standard clickthru.
		* markers[i].clickthru.url - An optional URL value that will override the default Google Maps link.
	* The Map Draw function supports all of the optional marker specifications.  For more detailed information,  please visit the [Google Maps Marker API page](https://developers.google.com/maps/documentation/javascript/markers)._

Example:

```
<div id="google_map"></div>
<script>
var google_map = dojo.gid('google_map');
var mapOptions = {
	'lat': 47.676308399999996,
	'lng': -122.20762579999999,
	'map_id': google_map,
	'map_zoom': 10,
	'markers': [],
}
//Pretend the data variable is an object that contains store infromation.
for(var i in data.results){
	var numAdd = eval(i+1);
	mapOptions.markers.push({
		'lat': data.results[i].lat,
		'lng': data.results[i].lng,
		'title': data.results[i].name,
		'zIndex': numAdd,
		'clickthru': {
			'name': 'GoogleMaps'
		}
	});
}
dojo.gmaps_draw(mapOptions);
</script>
```

[top](#dojo-framework-library)

---

### Standard AJAX Requests

This function allows for AJAX requests.  Both GET and POST requests are supported.  If the expected return data is in JSON format, instructions can be passed to convert the data into a JavaScript object.  Using a callback function is optional, but will be necessary to use the response data.  Unless explicitly specified in a campaign contract, we are not responsible for ensuring cross-domain access or any other accessiblity issue concerning a non-Phluant AJAX source.

Required specs:

* url - The URL the request is being made to.

Optional specs:

* callback - The callback function for the data.
* data - An object of any GET/POST key/value pairs needed to complete the request.
* method - Can be either GET or POST.  Default is GET.
* js_object - Can be set to true or false.  Should only be set if the expected return data is JSON.
* timeout - The timeout for the AJAX call.  Default is 10000 miliseconds.

Example:

```
<script>

 function ajaxReturn(data){
 	console.log(data);
 }

 dojo.ajax({
 	'url': 'http://somesite.com/get/some/data',
 	'callback': ajaxReturn,
 	'json_return': 'true',
 	'method': 'GET',
 	'timeout': 10000,
 	'data': {
 		'foo': 'bar',
 		'getmy': 'data',
 	}
 });
 </script>
```

[top](#dojo-framework-library)

 ---

### Image tracker

 This functin provides the ability to fire off 1x1 image trackers for custom events other than the initialization.  For code-based trackers, please utilize the [AJAX](#standard-ajax-requests) function.

Example:

```
<script>
dojo.image_tracker('http://somesite.com/1x1_image_gif');
</script>
```

[top](#dojo-framework-library)

 ---

### Mobile and Platform Specific Detection

This set of functions provides a method to detect if a mobile/tablet device is being used, along with specific type.  It will detect Android, Blackberry, iOS, Opera Mini, Windows Mobile, or if the user is using any of the previously mentioned platforms.  Returns null if the device isn't detected.

Example:

```
<script>
console.log(dojo.isMobile.Android());
console.log(dojo.isMobile.Blackberry());
console.log(dojo.isMobile.iOS());
console.log(dojo.isMobile.Opera());
console.log(dojo.isMobile.Windows());
console.log(dojo.isMobile.any());
</script>
```

[top](#dojo-framework-library)

---

### iOS version detection

This variable provides a method to detect what iOS version, if any, is being run.  This is namely for iOS 7, which currently has usability issues and bugs in the Safari browser.  Returns the numerical verision if an iOS version, returns 0 for all other devices.

Example:

```
<script>
console.log(dojo.iosVersion);
</script>
```

[top](#dojo-framework-library)

---

### Query String Detection

This function detects and returns any query string keys and values as a JavaScript object.  Can be specified as JSON if desired.  It works when the URL has a standard query string format.  Returns false if no query string is detected.

Example URL:  http://somesite.com/index.html?foo=bar&getmy=data.

Example JavaScript:
```
<script>
var query_string = dojo.query_string();
//If JSON format is desired
var query_string_json = dojo.query_string(true);
console.log(query_string);
</script>
```

[top](#dojo-framework-library)

---

### Word Capitalization

This function returns a capitalized version of a specified word.

Example:
```
<script>
console.log(dojo.capitalize('jordan'));
</script>
```

[top](#dojo-framework-library)

---

### Email Validation

This function returns a regex result for a valid email foramt.

Example:
```
<script>
console.log(dojo.valid_email('somebody@somesite.com'));
</script>
```

[top](#dojo-framework-library)

---

### Phone Number Validation

This function returns a regex result for a valid North American phone number.  It will automatically strip out any non-numeric characters.

Example:
```
<script>
console.log(dojo.valid_phone('555-555-5555'));
</script>
```

[top](#dojo-framework-library)

---

### Zip Code Validation

This function returns a regex result for a valid US zip code, with both 5 digit and hyphenated 9 digit formats supported.

Example:
```
<script>
console.log(dojo.valid_zip('98034'));
</script>
```

[top](#dojo-framework-library)

---

### Technical Support

Phluant Mobile is committed to helping our clients in successfully using this framework to design and develop their mobile advertisements.  Please feel free to utilize this repository's [issue tracker](../../issues) for general feedback, feature requests, bug reports, tech support questions, etc.  

[top](#dojo-framework-library)

---

Copyright 2014 Phluant Mobile, Inc.  All rights reserved.  This framework library is intended for use by Phluant Mobile clients for designing and developing mobile advertisements intended for eventual use in Phluant's ad serving network.  All other use is strictly prohibited.
