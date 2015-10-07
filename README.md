# Dojo Framework Library

The Dojo Framework (dojo) Library is a framework for use by Phluant Mobile's clients in developing their rich media campaign assets.  The concept of the framework is to provide our clients with a code base that works both inside and outside of our Dojo ad serving network, which will substantially reduce the amount of time needed to launch a rich media campaign.  It also provides a number of core features that are very common in the rich media campaigns we run.  It is written in pure JavaScript, so all core features will work independently of jQuery or any other JavaScript framework library.  Some features may require supporting libraries (i.e. Google Maps) and will be indicated as such in the documentation.  The feature list is below.

* [Element ID referencing](#element-id-referencing)
* [Initialization](#initialization)
* [Automatic MRAID detection and handling](#initialization)
* [Expand](#expand)
* [Contract](#contract)
* [Clickthru](#clickthru)
* [Custom trackers](#custom-trackers)
* [HTML5 video](#html5-video)
* [All geolocation and weather API calls to Phluant's resources](#geolocationweather-api-calls)
	* [Geolocation](#geolocation)
	* [Weather](#weather)
* [HTML5 geolocation prompt with optional IP lookup as a fallback](#geolocation-prompt)
* [Store locator API call](#store-locator-api-call)
* [ShopLocal API call](#shoplocal-api-call)
* [Google Maps](#google-maps)
	* [Geocoding](#geocoding)
	* [Map Draw](#map-draw)
* [Standard AJAX Requests](#standard-ajax-requests)
* [Image Tracker](#image-tracker)
* [Mobile and platform specific detection](#)
* [iOS version detection (namely for iOS 7)](#ios-version-detection)
* [Query string detection](#query-sring-detection)
* [Word Capitalization](#word-capitalization)
* [Email Validation](#email-validation)
* [Phone Number Validation](#phone-number-validation)
* [Zip Code Validation](#zip-code-validation)
* [Technical Support](#technical-support)
* [Contributing and Testing](#contributing-and-testing)

---

## How To Use

Place the JavaScript tag referencing the framework before any campaign specific code.  You may do this either in the head or inline.  We recommend you use the minified version for any non-development work. Each version of the framework is hosted on our CDN for optimal delivery.

For the latest stable release use:
http://mdn4.phluantmobile.net/jslib/dojo/dojo.min.js (production)
or http://mdn4.phluantmobile.net/jslib/dojo/dojo.js (development)

*However, we recommend that you __specify the version number__ in order to ensure stability.  As of August 2015, the most up to date version is 0.5.2.  Please check __releases__ for the most up-to-date version.*

Specific releases can be used by appending "-{MAJOR}.{MINOR}.{PATCH}". For example:

```html
<!-- production -->
<script src="http://mdn4.phluantmobile.net/jslib/dojo/dojo-0.5.2.min.js"></script>
<!-- development -->
<script src="http://mdn4.phluantmobile.net/jslib/dojo/dojo-0.5.2.js"></script>
```

[top](#dojo-framework-library)

---

### Element ID referencing

```javascript
dojo.gid( elementId );
```

#### Arguments
**elementId**  
Type: String  
A string containing the ID of the element you would like to reference.

#### Description
This function is a shortcut for ```document.getElementById()```.

Example:

```javascript
var expand_div = dojo.gid('expand_div');
var close_btn = dojo.gid('close_btn');
```

_Optional_

[top](#dojo-framework-library)

---

### Initialization

```javascript
dojo.init( settings );
```

#### Arguments

**settings**  
Type: Object  
Key/value pairs to set init options.

- **init**  
  Type: Function  
  The initialization callback function for an ad.  Required for any ad running on MRAID.  Recommended in all cases.
- **callback**  
  Type: Function  
  Callback function that is executed when an expanded ad is contracted.  Required for any expandable ad running on MRAID.  Recommended in all cases.
- **expanded**  
  Type: Boolean  
  Indicates if the ad begins in an expanded state.  Should be set to **true** for interstitial ads.  Only required for interstitial ads.
- **asynch_load**  
  Type: Object  
  This allows ad to asynchronously load any JavaScript scripts before running the initialization callback.  Default is null.  Not required.
  - **insert_before**  
    Type: String  
    Designates the reference element that the library will use to reference the load.
  - **scripts**  
    Type: Array of Strings  
    Designates the script URLs to load before running the initialization callback.
- **useCustomClose**  
  Type: Boolean  
  Set to true to use your own close graphic & behavior, otherwise a default close button and click behavior will be added.
- **expandedEl**  
  Type: String  
  ID of the element within which to add the close button.  If not included, will try to get the element with id of 'expanded'.

#### Description

This function initializes the framework for expandable ads and interstitial/banner ads that need close functionality.  It also initializes any MRAID specific functionality if the MRAID framework is detected.  The developer will need to ensure an appropriate callback function is designated for contracting/closing the ad.  If the callback function contains object function calls, the object must have an explicit reference.

Example:

```javascript
function contractAd(){
	expand_div.style.display = 'none';
	contract_div.style.display = 'block';
}

function initialize(){
	//Initialization code.
}

dojo.init({
	'init': initialize,
	'callback': contractAd,
	'expanded': false,
	'asynch_load': {
		'insert_before': document.getElementsByTagName('head')[0],
		'scripts': ['http://code.jquery.com/jquery.min.js', 'http://somesite.com/somescript.js']		
	},
	'useCustomClose': false,
	'expandedEl': 'expanded'
});
```

_Required for all expandable ads, interstitial/banner ads that need close funcitonality, and any ad that will run in MRAID._

[top](#dojo-framework-library)

---

### Expand

```javascript
dojo.expand( width, height );
```

#### Arguments

**width**  
Type: Integer or String  
If argument is an integer, indicates the width in number of pixels.  Otherwise, a String containing any valid css value may be used.  

**height**  
Type: Integer or String  
If argument is an integer, indicates the height in number of pixels.  Otherwise, a String containing any valid css value may be used.  

#### Description

Use this function for expandable ads, to switch between contracted and expanded state.  This method resizes the ad's iframe container to the specified size (if necessary), fires off the appropriate reporting tracker, and expands the webview to take up the entire screen if executed in an MRAID environment. This will automatically begin tracking the amount of time the ad has been expanded.

Note that you still need to resize the ad creative manually.

Example:

```javascript
expand_btn.addEventListener('click', function(){
	expand_div.style.display = 'block';
	contract_div.style.display = 'none';
	dojo.expand(320, 480); // 320x480 pixels
}
```

**OR**
```javascript
expand_btn.addEventListener('click', function(){
	// code...
	dojo.expand("320px", "480px"); // Also 320x480 pixels
}
```

_Required for all expandable ads._

[top](#dojo-framework-library)

---

### Contract

```javascript
dojo.contract();
```

#### Arguments

None

#### Description

Use this function for expandable ads, to switch from expanded and contracted state.  It deconstructs any necessary components (such as HTML5 video), restores the ad's iframe container to the size it was before expansion (if necessary), fires an appropriate reporting tracker, executes the close callback provided at initialization, and calls mraid.close() when executed in an MRAID environment.  This also stops and resets tracking for time spent in the expanded state.

Example:

```javascript
contract_btn.addEventListener('click', function(){
	dojo.contract();
});
```

_Requried for all expandable ads as well as interstitial/banner ads that require close functionality._

[top](#dojo-framework-library)

---

### Clickthru

```javascript
dojo.clickthru(vars);
```

#### Arguments

**vars**  
Type: Object  
Key/value pairs to set clickthru options.

- **name**  
  Type: String  
  A name to describe the clickthrough (for reporting purposes only).  Recommended in all cases.
- **url**  
  Type: String  
  The landing page URL.  Required.
- **prepend**  
  Type: String  
  A click prepend to be added in front of the URL, usually used for third party click tracking.  Completely optional.

#### Description

This function ensures any user initiated clickthrough is recorded in DOJO (if served through DOJO), and will open the destination URI in either a new browser tab (mobile web) or in the mobile app's web view (in-app / MRAID).  For assets running outside of our ad serving network, the reporting name will be logged to the console.

Note that when using a prepend, an encoded version of the URL will be added to the end of the prepend

Example with two different clickthru items.  DOJO reporting will tally each of them separately:

```html
<button id="shoes" href="http://somesite.com/shoes">Buy Shoes</button><br />
<button id="boots" href="http://somesite.com/boots">Buy Boots</button>
<script>
document.getElementById('shoes').addEventListener("click", function (e){
    e.preventDefault();
    dojo.clickthru({
    	'url': "http://somesite.com/shoes",
    	'name': "shoes"
    });
});

document.getElementById('boots').addEventListener("click", function (e){
    e.preventDefault();
    dojo.clickthru({
    	'url': "http://somesite.com/boots",
    	'name': "boots"
    });
});
</script>
```

Example using a click prepend:

```html
<button id="clickthrough"></button>
<script>
document.getElementById('clickthrough').addEventListener('click', function(){
	dojo.clickthru({
		'url': 'http://somesite.com',
		'name': 'clickthrough',
		'prepend': 'http://ad.tracker.net/click/a1bc23d4?url='
	});
});
// On click user is sent to http://ad.tracker.net/click/a1bc23d4?url=http%3A%2F%2Fsomesite.com
// (Encoded version of URL is added to the end of the prepend URL)
</script>
```
_Required for all clickthroughs that are to be tracked, recommended in all other cases._

[top](#dojo-framework-library)

---

### Custom Trackers

```javascript
dojo.track(name);
```

#### Arguments

**name**  
Type: String  
Descriptive name of tracking event (i.e. 'swipe right', 'select product', etc.)

#### Description

This function allows custom interactions to be tracked inside DOJO (such as a user navigating to a certain section of the ad, etc.).  For assets running outside of our ad serving network, a message displaying the reporting name will logged to the console.

By default, if a tracking event occurs while an ad is in the expanded state, this is assumed to be a user interaction, and will extend expanded time tracking for another 15 seconds.  If the tracking event is not triggered by a user interaction, **true** must be passed in as a second argument to indicate that this tracking occurred without user interaction.

**Warning regarding event tracking**  
We would not recommend recording a large variety of unique events, as this will slow down reporting in DOJO and increase the size of generated reports (for each unique event tracked, an additional column is added the the reporting spreadsheet).  If running in DOJO, please reach out to your campaign manager to decide the number and type of events to track.

Example:

```javascript
var shoes = document.getElementById('shoes');
var boots = document.getElementById('boots');

shoes.addEventListener('click', function(){
	shoes.className = 'active';
	boots.className = '';
	dojo.track('Shoes selected');
});

boots.addEventListener('click', function(){
	boots.className = 'active';
	shoes.className = '';
	dojo.track('Boots selected');
});
```

[top](#dojo-framework-library)

---

### HTML5 Video *(Legacy functionality scheduled to be modified in dojo.js version 1.0.0)*

This function ensures that any HTML5 video that needs to be played can have the proper code rendered, inside or outside of Phluant's ad serving network.  It isn't necessary to include any video tags in the HTML.  All that is needed is a container element and the proper JavaScript code.  It is also possible for a video to auto play on an expansion.  All that would be required is to add in the function callup to the applicable expand code.  All videos automatically close on the completion of the video or contracting the ad.  For any other events that require closure, ```dojo.video_close()``` can be utilized.

Returns an HTML5 video element.

Required Attributes:

* video_url: The URL for the video source.  Can be relative (same server) or absolute (remote server).
* container_id: The DOM element ID for the container in which to add the video.

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
* Standard HTML video events are emitted on the returned video element.  Additionally, custom quartile events will be emitted on the returned video element for 25%, 50%, and 75% watched (events are 'quartile25', 'quartile50', 'quartile75')

Example:

```
<div id="video_container"></div>
<script>
var container = dojo.gid('video_container');
var videoElement;
container.addEventListener('click', function(){
	if(!dojo.videoPlaying){
		videoElement = dojo.video({
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

// To add listeners:
videoElement.addEventListener('play', function(){...})
</script>
```

[top](#dojo-framework-library)

---

### Geolocation/Weather API calls

```javascript
var vars = {
	'callback': callback,
	'data': {
		'type': type,
		'subtype': subtype,
		'value': value,
		'end': end
	}
};

dojo.geolocation({ vars });
```

#### Arguments

**vars**  
Type: Object  
Key/value pairs to set geolocation options.

- **callback**  
  Type: Function  
  Callback function to run when data is returned.  Required.
- **data**  
  Type: Object  
  Data object containing key/value pairs to send with the GET request.  Optional - if this is not included, a simple geolocation request by IP addess is made.
  - **type**  
    Type: String  
    Options are `'dma'`, `'postal_code'`, `'geo_by_address'`, `'address_by_geo'`, `'city_postal_by_geo'`, `'weather'`, `'ip_address'`.  Optional, defaults to `'ip_address'` if not specified.
  - **subtype**  
    Type: String
    Options are `'postal_code'`, `'geo'`, `'ip'`.  Optional, defaults to `'ip'` if not specified.
  - **value**  
    Type: String
    Required in some cases depending on the type selected above, see specifications below.
  - **end**  
    Type: String
    _For weather calls only._  Specifies the time/date range of weather data to request, to a maximum of 14 days.  Acceptable values would include '3 days' or '12 hours', for example.  Optional, defaults to `'1 day'` if not specified.

Phluant maintains a web based application capable of providing geolocation and weather information based on location, using Maxmind and National Weather Service resources respectively.  All lookups are done by AJAX and require the developer to specify a callback function to return the data. See below for descriptions of the different **types**.  When using geolocation by IP address, please be aware the mobile data providers have a lot of flexibility in assigning IP addresses to users, which may return an inaccurate location.  If geocoordinates can't be obtained from the publisher and precise geocoordinates are needed, it's recommended to use the [HTML5 Geolocation Prompt](#geolocation-prompt).

#### IP Address (`'ip_address'`)

Looks up user's location by IP Address.  *Note:* mobile data providers have flexibility in assigning IP addresses to users, thus **accuracy** of geolocation **may vary**.

##### Additional Data Parameters

- **subtype**  
  Not applicable to this type.
- **value**  
  Type: String
  The user IP Address can be optionally passed in this parameter, otherwise the user's IP will be looked up.
- **end**  
  Not applicable to this type.

Example:

```javascript
function handleReturnedData(data){
	// Do something
}

dojo.geolocation({
	'callback': handleReturnedData,
});
```

Returned Object Example:



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

_For a comprehensive address lookup, please see the [Google Maps Geocoding](#geocoding) function._

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

### Store Locator API Call *(Legacy functionality scheduled to be removed in dojo.js version 1.0.0)*

This function provides certain clients the ability to pull store location information information for various ads, namely to display the closest number of stores in relation to the user.  If your campaign has been set up with this feature, this API call will work for you.  All lookups are done by AJAX and require the developer to specify a callback function to return the data.

Lookup Methods:

* IP address (default)
* Lat/lng
* Postal Code

Required Specs:

* callback - the callback function.
* data.campaign_id - the campaign ID assigned by Phluant.


Optional Specs:

* data.limit - the limit on the number of stores.  Default is 3.
* data.dist - the limit on the maximum radius distance in miles.  Default is 30.
* data.subtype - specify as geo or postal_code.
* data.value - if subtype is declared, use this spec to declare the value.

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

//Distance and limit are shown as an example and can be omitted if satisfied with default values.  Subtype and value must be specified for a geolocation lookup.
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

Store Location by Postal Code Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values.  Subtype and value must be specified for a geolocation lookup.
dojo.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30,
		'subtype': 'postal_code',
		'value': '98033'
	}
});
</script>
```

[top](#dojo-framework-library)

---

### ShopLocal API Call *(Legacy functionality scheduled to be removed in dojo.js version 1.0.0)*

Because Phluant has an established relationship with ShopLocal, we are already set up to aggregate ShopLocal data to our ads. Any Phluant client with an established ShopLocal campaign can utilize this function to call in relevant ShopLocal store and category data.  Store and category data can be looked up all at once or separately.  All lookups are done by AJAX and require the developer to specify a callback function to return the data.  All data is returned in JavaScript object format.

Lookup Methods:

* IP address (default)
* Lat/lng
* Postal Code

Required Specs:

* callback - the callback function.
* data.campaignid - the campaign ID assigned by ShopLocal.  This is NOT the same campaign ID assigned by Phluant.
* data.company - the company name assigned by ShopLocal.


Optional Specs:

* data.subtype - For obtaining the user's location if an IP based lookup isn't desired.  Specify as geo or postal_code if desired.
* data.value - Set to applicable value if data.suptype is geo or postal_code.
* data.call_type - default is store.  While any number of different categories can potentially work, only retailertag has been fully tested with our system.  Separate multiple call types with a comma.  This spec will override the default.
* data.<category>ids - Used in conjunction with retailertag or any other category, and is required if the related category is set.  Separate multiple category id's with a comma.
* data.storeid - Used to look up categories from a specified store.  Please be aware that this value isn't necessary if the stores are being looked up along with a category, as the first store in the query result will override this value.
* listingcount - Default is 50.
* listingimagewidth - Default is 90.
* resultset - Default is full.
* sortby - Default is 6.
* data.pd - Used for some ShopLocal campaigns to override any date restrictions for development purposes.  This is a value assigned by ShopLocal.
* data.name_flag - If set, the system will watch out for any store name containing this value and remove it from the results.

ShopLocal by IP Example:

```
<script>
function ShopLocalReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.
dojo.ShopLocal({
	'callback': storeReturn,
	'data': {
		'campaignid': 'abc123def456',
		'company': 'ABC, Inc.',
		'call_type': 'store,retailertag',
		'retailertagids': '2334'
	}
});
</script>
```

ShopLocal by Geo Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.  Subtype and value must be specified for a geolocation lookup.
dojo.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaignid': 'abc123def456',
		'company': 'ABC, Inc.',
		'call_type': 'store,retailertag',
		'retailertagids': '2334',
		'subtype': 'geo',
		'value': 'value': '47.676308399999996,-122.20762579999999'
	}
});
</script>
```

ShopLocal by Postal Code Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Optional values are shown as an example and can be omitted if satisfied with defaults.  Subtype and value must be specified for a geolocation lookup.
dojo.shoplocal({
	'callback': storeReturn,
	'data': {
		'campaignid': 'abc123def456',
		'company': 'ABC, Inc.',
		'call_type': 'store,retailertag',
		'retailertagids': '2334'
		'subtype': 'postal_code',
		'value': 'value': '98033'
	}
});
</script>
```

* The bulk of all store related data can be found in data.stores.results.collection.data.  Multiple locations may exist.
* The bulk of all category data, using retailertag as an example, can be found in data.retailertag.xxxx.results.collection[0][0].
* If an IP address or geolocation was used to calculate the user's address, the results will be returned.  The data can be found in data.user_info.results.

*Because ShopLocal return data can vary and this library is still in beta, we working on expanding the return data samples.*

[top](#dojo-framework-library)

---

### Geolocation Prompt

The function provides a means to prompt the user for their geo-coordinates.  A callback function must be included to receive the results, which are returned as a JavaScript object if the user approves, or a false boolean if the user declines.  The developer can optionally specify to use the [Geolocation IP lookup](#geolocation) as a failover and specify a failover callback.

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
* callback - The callback function.

Optional Specs:
* failover - Default is false.  The system will determine which method to use based on the address qualities.
* loc_type - Default is address.  If set to geo, the library will do a reverse geocode so long as the address is set as lat,lng.  Google limits the number of reverse geocodes to 5 per page onload event, so use sparingly.
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

* map_zoom - the zoom level of the map. A bounding box is generated from the markers by default.
* user_lat - the latitude for the user's location.  Required for the default Google Maps clickthrough.
* user_lat - the longitude for the user's location.  Required for the default Google Maps clickthrough.
* markers - an object containing relevant information for any desired markers.
	* markers[i].events - an object that has event names for keys and callback functions for values.
	* markers[i].lat - the latitude of the desired marker.  Required for marker to be set.
	* markers[i].lng - the longitude of the desired marker.  Required for marker to be set.
	* markers[i].clickthru - an object containing relevant information for any marker to be a clickthrough.  Default is a Google Maps hyperlink using the original lat/lng values as the start point and the lat/lng values as the end point
		* markers[i].clickthru.name - the name of the clickthrough, used for reporting.  Essentially the same functionality as a standard clickthrough.
		* markers[i].clickthru.url - An optional URL value that will override the default Google Maps link.
		* markers[i].clickthru.callback - An optional callback function that will call up custom code before the clickthrough is run.
	* The Map Draw function supports all of the optional marker specifications.  For more detailed information,  please visit the [Google Maps Marker API page](https://developers.google.com/maps/documentation/javascript/markers).

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
//Pretend the data variable is an object that contains store information.
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

This function allows for AJAX requests.  Both GET and POST requests are supported.  Using Yahoo Query Language (YQL) is also supported for enhanced CORS capabilities.  If the expected return data is in 100% JSON or XML format, instructions can be passed to convert the data into a JavaScript object.  Using a callback function is optional, but will be necessary to use the response data. Unless explicitly specified in a campaign contract, Phluant is not responsible for ensuring cross-domain access or any other accessibility issue concerning a non-Phluant AJAX source.  YQL may not resolve all cross-domain access issues.

Required specs:

* url - The URL the request is being made to.

Optional specs:

* callback - The callback function for the data.
* yql - Default is false.  Set to either true, or list as an object to specify the format.
	* yql.format - Default is json if yql is utilized.  Can be changed to xml or any other YQL supported format.
* data - An object of any GET/POST key/value pairs needed to complete the request.
* method - Default is false.  Should only be set to true if the expected return data is JSON or XML.
* timeout - The timeout for the AJAX call.  Default is 10000 milliseconds.
* asynch - Default is true.  Set to false for synchronous AJAX calls.

Example:

```
<script>

 function ajaxReturn(data){
 	console.log(data);
 }

 dojo.ajax({
 	'url': 'http://somesite.com/get/some/data',
	 'yql': {
			'format': 'xml',
		},
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

 This function provides the ability to fire off 1x1 image trackers for custom events other than the initialization.  For code-based trackers, please utilize the [AJAX](#standard-ajax-requests) function.

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

This variable provides a method to detect what iOS version, if any, is being run.  This is namely for iOS 7, which currently has usability issues and bugs in the Safari browser.  Returns the numerical version if an iOS version, returns 0 for all other devices.

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

This function returns a regex result for a valid email format.

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

Phluant Mobile is committed to helping our clients in successfully using this framework to design and develop their mobile advertisements.  Please feel free to utilize this repository's [issue tracker](../../issues) for general feedback, feature requests, bug reports, tech support questions, etc.  See a bug and know how to fix it, or know how to make this repository better?  Please feel free to make a fork, make necessary modifications, and submit a pull request to us.

[top](#dojo-framework-library)

---

### Contributing and Testing

If you would like to contribute an improvement or a bug fix, please:

* Ensure all code passes [jshint](http://jshint.com/)
* Ensure all functionality works in both mobile web and MRAID (in-app) environments

---

Copyright 2014 Phluant Mobile, Inc.  All rights reserved.  This framework library is intended for use by Phluant Mobile clients for designing and developing mobile advertisements intended for eventual use in Phluant's ad serving network.  All other use is strictly prohibited.
