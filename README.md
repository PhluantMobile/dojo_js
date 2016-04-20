# Dojo Framework Library

The Dojo Framework (dojo) Library is a framework for use by Phluant Mobile's clients in developing their rich media campaign assets.  The concept of the framework is to provide our clients with a code base that works both inside and outside of our Dojo ad serving network, which will substantially reduce the amount of time needed to launch a rich media campaign.  It also provides a number of core features that are very common in the rich media campaigns we run.  It is written in pure JavaScript, so all core features will work independently of jQuery or any other JavaScript framework library.  Some features may require supporting libraries (i.e. Google Maps) and will be indicated as such in the documentation.  The feature list is below.

* [How To Use](#how-to-use)

###### Legacy Functionality

* [Element ID referencing](#element-id-referencing)
* [Store locator API call](#store-locator-api-call)
* [ShopLocal API call](#shoplocal-api-call)

###### Basic Functionality and MRAID

* [Initialization](#initialization)
* [Expand](#expand)
* [Contract](#contract)
* [Clickthru](#clickthru)

###### Tracking

* [Custom trackers](#custom-trackers)
* [HTML5 video](#html5-video)
* [Image Tracker](#image-tracker)

###### Utility

* [Standard AJAX Requests](#standard-ajax-requests)
* [Mobile and platform specific detection](#mobile-and-platform-specific-detection)
* [iOS version detection (namely for iOS 7)](#ios-version-detection)
* [Query string detection](#query-string-detection)
* [Get Ad Tag Parameters](#get-tag-parameters)
* [Rounding](#rounding)
* [Word Capitalization](#word-capitalization)
* [Email Validation](#email-validation)
* [Phone Number Validation](#phone-number-validation)
* [Zip Code Validation](#zip-code-validation)

###### Geolocation Functionality

* [All geolocation and weather API calls to Phluant's resources](#geolocationweather-api-calls)
	* [Geolocation](#geolocation)
	* [Weather](#weather)
* [HTML5 geolocation prompt with optional IP lookup as a fallback](#geolocation-prompt)
* [Google Maps](#google-maps)
	* [Geocoding](#geocoding)
	* [Map Draw](#map-draw)

###### Support and Contributing

* [Technical Support](#technical-support)
* [Contributing and Testing](#contributing-and-testing)

---

## How To Use

Place the JavaScript tag referencing the framework before any campaign specific code.  You may do this either in the head or inline.  We recommend you use the minified version for any non-development work. Each version of the framework is hosted on our CDN for optimal delivery.

For the latest stable release use:
http://mdn4.phluantmobile.net/jslib/dojo/dojo.min.js (production)
or http://mdn4.phluantmobile.net/jslib/dojo/dojo.js (development)

*However, we recommend that you __specify the version number__ in order to ensure stability.  As of April 2016, the most up to date version is 1.0.0.  Please check __releases__ for the most up-to-date version.*

Specific releases can be used by appending "-{MAJOR}.{MINOR}.{PATCH}". For example:

```html
<!-- production -->
<script src="http://mdn4.phluantmobile.net/jslib/dojo/dojo-1.0.0.min.js"></script>
<!-- development -->
<script src="http://mdn4.phluantmobile.net/jslib/dojo/dojo-1.0.0.js"></script>
```

[top](#dojo-framework-library)

---

### Element ID referencing 

*Removed in version 1.0.0, use standard JavaScript methods instead, i.e.:*
```javascript
document.getElementById( elementId );
```

[top](#dojo-framework-library)

---

### Store Locator API Call

*Removed in version 1.0.0*

[top](#dojo-framework-library)

---

### ShopLocal API Call

*Removed in version 1.0.0*

[top](#dojo-framework-library)

---

### Initialization

```javascript
dojo.init( settings );
```

**settings**  
Type: Object  
Key/value pairs to set init options.

- **init**  
  Type: Function  
  The initialization callback function for an ad.  *Required* for any ad running on MRAID.  Recommended in all cases.
- **callback**  
  Type: Function  
  Callback function that is executed when an expanded ad is contracted.  If available, an Event is passed through to this function.  *Required* for any expandable ad running on MRAID.  Recommended in all cases.
- **expanded**  
  Type: Boolean  
  Indicates if the ad begins in an expanded state.  Should be set to **true** for interstitial ads.  Only *required* for interstitial ads.
- **useCustomClose**  
  Type: Boolean  
  Set to true to use your own close graphic & behavior, otherwise a default close button and click behavior will be added.
- **expandedEl**  
  Type: String or HTML Element  
  ID of the element within which to add the close button.  If not included, will try to get the element with id of 'expanded'.

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
	'useCustomClose': false,
	'expandedEl': 'expanded'
});
```

_Required for all expandable ads, interstitial/banner ads that need close functionality, and any ad that will run in MRAID._

[top](#dojo-framework-library)

---

### Expand

```javascript
dojo.expand( width, height );
```

**width**  
Type: Integer or String  
If argument is an integer, indicates the width in number of pixels.  Otherwise, a String containing any valid css value may be used.  

**height**  
Type: Integer or String  
If argument is an integer, indicates the height in number of pixels.  Otherwise, a String containing any valid css value may be used.  

Use this function for expandable ads, to switch between contracted and expanded state.  This method resizes the ad's iframe container to the specified size (if the ad is inside an iframe), fires off the appropriate reporting tracker, and expands the webview to take up the entire screen if executed in an MRAID environment. This will automatically begin tracking the amount of time the ad has been expanded.  Additionally, if a video has been set to play automatically on expand, it will play the video (see [HTML5 video](#html5-video)).

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

Use this function for expandable ads, to switch from expanded and contracted state.  It restores the ad's iframe container to the size it was before expansion (if necessary), fires an appropriate reporting tracker, executes the close callback provided at initialization, and calls mraid.close() when executed in an MRAID environment.  This also stops and resets tracking for time spent in the expanded state, and stops a video (if used with dojo.video, see [HTML5 video](#html5-video)).

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
dojo.clickthru(vars, silent);
```

**vars**  
Type: Object  
Key/value pairs to set clickthru options.

- **name**  
  Type: String  
  A name to describe the clickthrough (for reporting purposes only).  Recommended in all cases.
- **url**  
  Type: String  
  The landing page URL.  *Required*
- **prepend**  
  Type: String  
  A click prepend to be added in front of the URL, usually used for third party click tracking.  *Optional*

**silent**  
Type: Boolean  
If true, will not log the clickthrough URL as a developer event.  *Optional*


This function ensures any user initiated clickthrough is recorded in DOJO (if served through DOJO), and will open the destination URI in either a new browser tab (mobile web) or in the mobile app's web view (in-app / MRAID).  For assets running outside of our ad serving network, the reporting name will be logged to the console.

A prepend will automatically be included if one is present in the Phluant ad tag as a parameter (ClickPrependURL=...)

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
    	'name': "boots",
    });
});
</script>
```

Example using a click prepend:

```html
<div id="clickthrough"></div>
<script>
var clickthrough = document.getElementById('clickthrough');
clickthrough.addEventListener('click', function(){
	dojo.clickthru({
		'url': 'http://somesite.com',
		'name': 'clickthrough',
		'prepend': 'http://ad.tracker.net/click/a1bc23d4?url='
	});
});
// On click user is sent to http://ad.tracker.net/click/a1bc23d4?url=http%3A%2F%2Fsomesite.com
</script>
```
_Required for all clickthroughs that are to be tracked, recommended in all other cases._

[top](#dojo-framework-library)

---

### Custom Trackers

```javascript
dojo.track(description, isAutoFired);
```

**description**  
Type: String  
Description of custom tracking event (i.e. 'swipe right', 'select product', etc.)

**isAutoFired**  
Type: Boolean  
If set to true, indicates tracking event is automatically fired, thus time tracking should not be extended

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

### HTML5 Video 

*Legacy functionality updated in dojo.js version 1.0.0*

```javascript
dojo.video(videoElement, shouldPlayOnExpand);
```

**videoElement**  
Type: String or Video Element  
String with ID of ```<video>``` tag, or actual video element

**shouldPlayOnExpand**  
Type: Boolean  
Sets whether video should autoplay on expand (true will autoplay on expand, false will not)

This function adds standard event tracking to any ad utilizing HTML5 video, and also allows the video to auto-play on expand and stop on contract.  This adds tracking for play, pause, quartiles (25%, 50%, 75%), ended, seeked, and volumechange.

Returns the HTML5 video element.

Example:

```html
<video id="video-1" src='video.mp4'></video>
```

```javascript
dojo.video('video-1', true);
// Adds trackers to video, sets to auto-play on expand
```

*OR*

```javascript
dojo.video(document.getElementById('video-1', false);
// Adds trackers to video, will not auto-play on expand
```

[top](#dojo-framework-library)

---

### Image tracker

```javascript
 dojo.image_tracker(url);
```

**url**  
Type: String  
Image URL  *Required*

This function provides the ability to fire off 1x1 image trackers for custom events other than the initialization.  For code-based trackers, please utilize the [AJAX](#standard-ajax-requests) function.

Example:

```javascript
 dojo.image_tracker('http://somesite.com/1x1_image_gif');
```

[top](#dojo-framework-library)

---

### Standard AJAX Requests

```javascript
 dojo.ajax(options);
```

**options**  
Type: Object  
Key/value pairs to set options

- **url**  
  Type: String  
  AJAX request endpoint  *Required*
- **callback**  
  Type: Function  
  Function to call after ajax request (both successful and unsuccessful) *Suggested*
- **yql**  
  Type: Object  
  Indicates if Yahoo Query Language (YQL) should be used
  - **format**  
    Type: String  
    Sets expected return format for data, can be 'xml' or 'json'
- **data**  
  Type: Object  
  An object of key/value pairs needed to complete the request
- **method**  
  Type: String  
  HTTP method ('GET' or 'POST'), defaults to 'GET'
- **js_return**  
  Type: Boolean  
  Set to true if JSON or XML return data is expected, defaults to false
- **timeout**  
  Type: Number  
  Set request timeout (in milliseconds), defaults to 10000 milliseconds (10 seconds)
- **async**  
  Type: Boolean  
  Set whether AJAX calls should be performed asynchronously, default is true

Sends AJAX request, GET and POST requests are supported.  Using Yahoo Query Language (YQL) is also supported for enhanced CORS capabilities.  If expected return data is JSON or XML, data is converted into a JavaScript object.

Phluant is not responsible for ensuring cross-domain access or any other accessibility issue concerning a non-Phluant AJAX source.

Example:

```javascript
 function ajaxReturn(data){ console.log(data); }

 dojo.ajax({
 	'url': 'http://somesite.com/get/some/data',
	'yql': { 'format': 'xml' },
 	'callback': ajaxReturn,
 	'js_return': 'true',
 	'method': 'GET',
 	'timeout': 5000,
 	'data': {
 		'foo': 'bar',
 		'getmy': 'data',
  },
  'async': 'true'
 });

 // Response

 { 
  "status":"success",
  "results": {...}, // Response data
  "info": XMLHttpRequest
 }
```

[top](#dojo-framework-library)

---

### Mobile and Platform Specific Detection

```javascript
 dojo.isMobile.Android();
 dojo.isMobile.Blackberry();
 dojo.isMobile.iOS();
 dojo.isMobile.Opera();
 dojo.isMobile.Windows();
 dojo.isMobile.any();
```

These functions will detect if a mobile/tablet device is being used, and the device type.  It can detect Android, Blackberry, iOS, Opera Mini, Windows Mobile, or can detect if the user is using any of the above.  Returns true or false (Boolean).

Example:

```javascript
 console.log(dojo.isMobile.Android());  // true

 console.log(dojo.isMobile.Blackberry());  // false
```

[top](#dojo-framework-library)

---

### iOS version detection

```javascript
 dojo.iosVersion;
```

This variable provides a method to detect what iOS version, if any, is being run.  Returns the numerical version if an iOS version is detected, otherwise returns 0.

Example:

```javascript
 console.log(dojo.iosVersion); // 8.2
```

[top](#dojo-framework-library)

---

### Query String Detection

```javascript
 dojo.query_string(shouldStringify);
```

**shouldStringify**  
Type: Boolean  
Set to true to return a string, otherwise a JS object is returned  *Optional*

This function detects and returns any query string keys and values as a JavaScript object.  Returned as a JS object by default, or optionally as a string.  Returns false if no query string is detected.

```javascript
 // http://somesite.com/index.html?foo=bar&getmy=data
 
 console.log(dojo.query_string());
 // {
 //  foo: "bar", 
 //  getmy: "data"
 // }

 console.log(dojo.query_string(true));
 // '{"foo":"bar","getmy":"data"}'
```

[top](#dojo-framework-library)

---

### Get Tag Parameters

```javascript
 dojo.getTagParams();
```

This function pulls any URL parameters included in the ad script tag.  Returns a JavaScript object.

```html
<script language="JavaScript1.1" src="http://dojo.phluant.com/adj/abcd1234efgh5678/abr=!ie;sz=320x50;ord=95176234?t=1&idfa=ABCD52E7-03EE-455A-B3C4-E57283966239&AppID=com.devuni.flashlight&lat=47.7041&long=-122.3277&trackingpixelurl=http%3A%2F%2Fexample.com%2Fpixel.jpg&ClickPrependURL=http%3A%2F%2Fclick.example.com%2Fabc123%3Fredirect%3D"></script>

<script>
console.log(dojo.getTagParams());

// Result:
// {
// 	"t":"1",
// 	"idfa":"ABCD52E7-03EE-455A-B3C4-E57283966239",
// 	"AppID":"com.devuni.flashlight",
// 	"lat":"47.7041",
// 	"long":"-122.3277",
// 	"trackingpixelurl":"http%3A%2F%2Fexample.com%2Fpixel.jpg",
// 	"ClickPrependURL":"http%3A%2F%2Fclick.example.com%2Fabc123%3Fredirect%3D"
// }
</script>
```

[top](#dojo-framework-library)

---

### Rounding

```javascript
 dojo.roundIt(num, decimalPlaces);
```

**num**  
Type: Number  
Number you would like to round  *Required*

**decimalPlaces**  
Type: Number  
Number of decimals to round to.  *Optional*, defaults to zero decimals

This function rounds a number to a specified decimal place.  A negative value may also be used for the decimal places to round to the neares ten, hundred, thousand, etc.

```javascript
dojo.roundIt(7447.7822, 1);
// returns 7447.8

dojo.roundIt(7447.7822, -2);
// returns 7400
```

[top](#dojo-framework-library)

---

### Word Capitalization

```javascript
 dojo.capitalize(string);
```

**string**  
Type: String  
String to capitalize  *Required*

This function returns a capitalized version of a word or string.

Example:

```javascript
console.log(dojo.capitalize('jordan')); // 'Jordan'
```

[top](#dojo-framework-library)

---

### Email Validation

```javascript
 dojo.valid_email(email_address);
```

**email_address**  
Type: String  
Email address to check  *Required*

This function checks for a valid email format.

Example:

```javascript
console.log(dojo.valid_email('somebody@somesite.com'));
// true

console.log(dojo.valid_email('onetwothree'));
// false
```

[top](#dojo-framework-library)

---

### Phone Number Validation

```javascript
dojo.valid_phone(phone_number);
```

**phone_number**  
Type: String  
Phone number address to check  *Required*

This function checks for a valid North American 10 digit phone number.  It will automatically strip out any non-numeric characters.

Example:

```javascript
console.log(dojo.valid_phone('555-555-5555'));
// true

console.log(dojo.valid_phone('2-4-6'));
// false
```

[top](#dojo-framework-library)

---

### Zip Code Validation

```javascript
dojo.valid_zip(zip);
```

**zip**  
Type: String  
Zip code to check  *Required*

This function checks for a valid US zip code, with both 5 digit and hyphenated 9 digit formats supported.

Example:

```javascript
console.log(dojo.valid_zip('98034'));
// true

console.log(dojo.valid_zip('98034-1234'));
// true

console.log(dojo.valid_zip('9803'));
// false
```

[top](#dojo-framework-library)

---

### Geolocation/Weather API calls

Phluant maintains a web based application capable of providing geolocation and weather information based on location, using Maxmind and National Weather Service resources respectively.  All lookups are done by AJAX and require the developer to specify a callback function to return the data. Please be aware the mobile data providers have a wide latitude in assigning IP addresses to users, which may return an inaccurate location.  If geocoordinates can't be obtained from the publisher and precise geocoordinates are needed, it's recommended to use the [HTML5 Geolocation Prompt](#geolocation-prompt).


#### Geolocation

```javascript
dojo.geolocation(options);
```

**options**  
Type: Object  
Key/value pairs to set options

- **callback**  
  Type: Function  
  The callback function to use after geolocation.  *Required*
- **data**  
  Type: Object  
  Key/value pairs to set geolocation types, values
    - **type**  
    Type: String  
    Type of geolocation - one of 'dma', 'postal_code', 'geo_by_address', 'address_by_geo', 'city_postal_by_geo', 'weather', 'ip_address'.  *Optional*, default is 'ip_address' if not specified.
    - **subtype**  
    Type: String  
    Required only for certain geolocation types - see below examples.
    - **value**  
    Type: String  
    Corresponding value of that specific call type.  Varies based on the geolocation type.

Geolocation Lookup Methods:
* [IP Address (default)](#ip-address)
* [Postal Code (US and Canadian only)](#postal-code)
* [DMA](#dma)
* [Coordinates(Lat/Long) by Address](#coordinates-by-address)
* [Address by Coordinates (Lat/Long)](#address-by-coordinates)
* [City/Postal Code by Coordinates (Lat/Long)](#city-by-coordinates)
* [Weather](#weather)

##### IP Address
```javascript
function geoReturn(data){
	// some function using data
}
// data type and value is not needed for geocoding by IP address
dojo.geolocation({
	'callback': geoReturn,
});

// Response Object
// Note that not all values are available in all circumstances.  Results will not include items that are not available
{ 
  "info": XMLHttpRequest,
  "results": { 
    city:"Seattle",
    country:"US",
    dma_code:819,
    lat:47.61,
    lng:-122.35,
    postal_code:98121,
    state_region:"Washington"
  },
  "status":"success"
}
```

##### Postal Code

```javascript
function geoReturn(data){
	// some function using data
}

dojo.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'postal_code',
		'value': '98033'
	}
});

// Response Object
// Note that not all values are available in all circumstances.  Results will not include items that are not available
{ 
  "info": XMLHttpRequest,
  "results": { 
    "postal_code":"98033",
    "lat":"47.673263",
    "lng":"-122.187029",
    "city":"Kirkland",
    "state_region":"WA",
    "county":"King",
    "country":"US"
  },
  "status":"success"
}
```

##### DMA
```javascript
function geoReturn(data){
	// some function using data
}
// data type and value is not needed for geocoding by IP address
dojo.geolocation({
    'callback': geoReturn,
    'data': {
        'type': 'dma',
        'value': '819' // DMA code number
    }
});

// Response Object
// Note that not all values are available in all circumstances.  Results will not include items that are not available
{
  "status":"success",
  "results":{
    "id":168,
    "dma_code":"819",
    "region_name":"Seattle-Tacoma, WA",
    "lng":-121.842,
    "lat":47.6212,
    "adperc":"21.3",
    "tvperc":"93.8",
    "cableperc":"72.8"
  },
  "info":{}
}
```

##### Coordinates by Address

```javascript
function geoReturn(data){
	// some function using data
}

dojo.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'geo_by_address',
		'value': '500 Yale Ave N, Seattle, WA 98109'
	}
});

// Response Object
// Note that not all values are available in all circumstances.  Results will not include items that are not available
{ 
  "info": XMLHttpRequest,
  "results":{
    "street_number":"500",
    "route":"Yale Ave N",
    "neighborhood":"SLU",
    "locality":"Seattle",
    "administrative_area_level_2":"King County",
    "administrative_area_level_1":"WA",
    "country":"US",
    "postal_code":"98109",
    "postal_code_suffix":"5680",
    "lat":47.6233544,
    "lng":-122.3301121
  },
  "status":"success"
}
```

##### Address by Coordinates

```javascript
function geoReturn(data){
	// some function using data
}

dojo.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'address_by_geo',
		'value': '47.6233544, -122.3301121'
	}
});

// Response Object
// Note that not all values are available in all circumstances.  Results will not include items that are not available
{ 
  "info": XMLHttpRequest,
  "results":{
    "street_number":"500",
    "route":"Yale Ave N",
    "neighborhood":"SLU",
    "locality":"Seattle",
    "administrative_area_level_2":"King County",
    "administrative_area_level_1":"WA",
    "country":"US",
    "postal_code":"98109",
    "postal_code_suffix":"5680",
    "lat":47.6233544,
    "lng":-122.3301121
  },
  "status":"success"
}
```

##### City by Coordinates

```javascript
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

// Response Object
// Note that not all values are available in all circumstances.  Results will not include items that are not available
{ 
  "info": XMLHttpRequest,
  "results":{
    "id":3535,
    "country":"US",
    "state_region":"WA",
    "city":"Kirkland",
    "postal_code":"98033",
    "lat":47.6815,
    "lng":-122.209,
    "dma_code":"819",
    "area_code":"425",
    "distance":1
  },
  "status":"success"
}
```

#### Weather

```javascript
dojo.geolocation(options);
```

**options**  
Type: Object  
Key/value pairs to set options

- **callback**  
  Type: Function  
  The callback function to use after weather forecast retrieval.  *Required*
- **data**  
  Type: Object  
  Key/value pairs to set geolocation types, values
    - **type**  
    Type: String  
    Should always be 'weather' for weather lookup
    - **subtype**  
    Type: String  
    Should be 'ip_address', 'postal_code' or 'geo'.  *Optional*, defaults to 'ip_address' if not specified.
    - **value**  
    Type: String  
    Location value corresponding to subtype, see below for examples.
    - **end**  
    Type: String  
    String containing the number of days desired, maximum 14 days worth of weather data can be collected.  *Optional*, default is one day if not specified.

Weather Lookup Methods:

* IP address (default)
* Postal code
* Lat/lng

Weather by IP Example:

```javascript
function weatherReturn(data){
	console.log(data);
}

//The data.end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.
dojo.geolocation({
	'callback': weatherReturn,
	'data': {
		'type': 'weather',
		'end': '3 days',
	}
});
```

Weather by Postal Code Example:

```javascript
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
```

Weather by Geolocation Example:

```javascript
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
```

*Response Example (Shortened)*

```javascript
{
  "status":"success",
  "info":  XMLHttpRequest,
  "results":
  {
    "city":"Boston",
    "state_region":"MA",
    "postal_code":"02108",
    "lat":"42.353806",
    "lng":"-71.102446",
    "nws_xml":"http://graphical.weather.gov/xml/sample_products/browser_interface/ndfdXMLclient.php?lat=42.353806&lon=-71.102446&product=time-series&begin=2016-3-25T00:00:00&end=2016-3-26T23:59:59&Unit=e&maxt=maxt&mint=mint&temp=temp&pop12=pop12&qpf=qpf&rh=rh&sky=sky&wspd=wspd&wdir=wdir&wx=wx&icons=icons",
    "nws_page":"http://forecast.weather.gov/MapClick.php?textField1=42.35&textField2=-71.10",
    "data": {
      "icon":
        [{
          "value":"http://forecast.weather.gov/images/wtf/nbkn.jpg",
          "start_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"http://forecast.weather.gov/images/wtf/nra20.jpg",
          "start_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "weather_conditions":
        [{
          "value":"",
          "start_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"chance light rain showers none ",
          "start_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "maximum_temp":
        [{
          "value":"55&deg;F",
          "start_valid_time":"2016-03-25T08:00:00-04:00",
          "end_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"64&deg;F",
          "start_valid_time":"2016-03-31T08:00:00-04:00",
          "end_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "minimum_temp":
        [{
          "value":"36&deg;F",
          "start_valid_time":"2016-03-25T20:00:00-04:00",
          "end_valid_time":"2016-03-26T09:00:00-04:00"
        },
        ...
        {
          "value":"40&deg;F",
          "start_valid_time":"2016-03-30T20:00:00-04:00",
          "end_valid_time":"2016-03-31T09:00:00-04:00"
        }],
      "hourly_temp":
        [{
          "value":"52&deg;F",
          "start_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"57&deg;F",
          "start_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "precipitation":
        [{
          "value":"0.06 inches",
          "start_valid_time":"2016-03-25T14:00:00-04:00",
          "end_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"0.00 inches",
          "start_valid_time":"2016-03-27T14:00:00-04:00",
          "end_valid_time":"2016-03-27T20:00:00-04:00"
        }],
      "cloud_cover":
        [{
          "value":"81%",
          "start_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"60%",
          "start_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "12_hour_precip_prob":
        [{
          "value":"81%",
          "start_valid_time":"2016-03-25T08:00:00-04:00",
          "end_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"24%",
          "start_valid_time":"2016-03-31T08:00:00-04:00",
          "end_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "humidity":
        [{
          "value":"83%",
          "start_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
        "value":"64%",
        "start_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "wind_speed":
        [{
          "value":"5.75 MPH",
          "start_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"14.96 MPH",
          "start_valid_time":"2016-03-31T20:00:00-04:00"
        }],
      "wind_dir":
        [{
        "value":"NW",
        "start_valid_time":"2016-03-25T20:00:00-04:00"
        },
        ...
        {
          "value":"SSW",
          "start_valid_time":"2016-03-31T20:00:00-04:00"
        }]
      },
      "timestamp":1458945013,
      "forecast_length":"1 days"
    }
  }
}
```

Explanation For Weather-Specific Items
* nws_xml: The URL for the original NWS XML output.
* nws_page: The URL for a human friendly NWS weather report page.
* data.icon:  An array of weather icon images provided by the NWS.  Within each result contains the value, which is a hyperlink to the image, and start_valid_time.
* data.weather_conditions: An array of the weather conditions summary.  Within reach result contains the value, which is a human readable summary of the weather, and start_valid_time.
* data.maximum_temp: An array of the maximum daytime temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.minimum_temp: An array of the minimum daytime temperatures in fahrenheit. Within reach result contains the value, along with start_valid_time and end_valid_time.
* data.hourly_temp: An array of the hourly temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.precipitation:  An array of the expected levels of precipitation in inches.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.clould_cover:  An array of the expected cloud cover levels in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.12_hour_precip_prob:  An array of the likeliness of precipitation in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.humidity:  An array of the humidity in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.wind_dir:  An array of the wind directions at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.wind_speed:  An array of the wind speed at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.

[top](#dojo-framework-library)

---

### Geolocation Prompt

```javascript
dojo.geolocation_prompt( settings );
```

**settings**  
Type: Object  
Key/value pairs to set options.

- **callback**  
  Type: Function  
  Callback function that is executed when an expanded ad is contracted.  *Required* for any expandable ad running on MRAID.
- **failover**  
  Type: Boolean  
  Set to true for the system to fail over to the Geolocation lookup by IP.

The function provides a means to prompt the user for their geo-coordinates.  A callback function must be included to receive the results, which are returned as a JavaScript object if the user approves, or a false boolean if the user declines.  The developer can optionally specify to use the [Geolocation IP lookup](#geolocation) as a failover and specify a failover callback.

Example:
```javascript
function geoPromptReturn(data){
	console.log(data);
}

//Object attributes are only necessary if the failover feature is desired.
dojo.geolocation_prompt({
	'callback': geoPromptReturn,
	'failover': true,
});

// Result Object
{ 
  lat: 47.6205063,
  lng: -122.3514661
}

```

[top](#dojo-framework-library)

---

### Google Maps

The following functions give a simplified method to utilize the Google Maps JavaScript API.  At present, both the geocoding and map drawing functions are supported.  Both features require the Google Maps JavaScript reference placed before the dojo.js reference, be it in the head or inline.  A callback function is also required. Example Google Maps JavaScript reference:

```
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
```

#### Geocoding

```javascript
dojo.gmaps_geo(options);
```

**options**  
Type: Object  
Key/value pairs to set options

- **callback**  
  Type: Function  
  The callback function to use after location retrieval.  *Required*
- **loc_type**  
  Type: String
  Should be 'address' for geocoding (get lat/long from address), 'geo' for reverse geocoding (get address from lat/long).  Defaults to 'address' if not specified.
- **address**  
  Type: Object  
  Full or partial address, city/state, postal code for 'address' type, comma separated lat/lng values for 'geo' type
- **failover**  
  Type: Boolean
  If set to true, will try alternative geocoding method if google geocoding does not work.
- **failover_callback**  
  Type: Function  
  Function to run if failover method successfully resolves geolocation

Returns Google Maps API information on a location.  May be a full or partial address, city/state, postal code, lat/lng values, etc. Specifying Phluant's [Geolocation](#geolocation) services as a failover is optional, and the system will detect to use the IP, Postal Code, or Lat/Lng lookup based on address format.  If the failover is not specified and Google doesn't return any data, a false boolean will be returned to the callback.

Geocoding example:

```javascript
function gmapsReturn(data){
	console.log(data);
}

function geoReturn(data){
	console.log(data);
}

//
// Geocode
//
dojo.gmaps_geo({
	'address': '98033',
	'callback': gmapsReturn,
	'failover': true,
	'failover_callback': geoReturn
});

//
// Reverse Geocode
//
dojo.gmaps_geo({
	'loc_type': 'geo',
	'address': '47.6903285, -122.3552972',
	'callback': gmapsReturn,
	'failover': true,
	'failover_callback': geoReturn
});

//
// Example Result (same for either method)
// 

{
  {
    "address_components":
    [
      { "long_name":"98033",
        "short_name":"98033",
        "types":["postal_code"]
      },
      { "long_name":"Kirkland",
        "short_name":"Kirkland",
        "types":["locality",
        "political"]
      },
      {"long_name":"King County",
        "short_name":"King County",
        "types":["administrative_area_level_2",
        "political"]
      },
      { "long_name":"Washington",
        "short_name":"WA",
        "types":["administrative_area_level_1",
        "political"]
      },
      { "long_name":"United States",
        "short_name":"US",
        "types":["country",
        "political"]
      }
    ],
    "formatted_address":"Kirkland,WA 98033,USA",
    "geometry":
    {
      "bounds":
      { 
        "south":47.6419889,
        "west":-122.23183499999999,
        "north":47.704279,
        "east":-122.15385500000002
      },
      "location":
      {
        "lat":47.6688298,
        "lng":-122.1923875
      },
      "location_type":"APPROXIMATE",
      "viewport":
      {
        "south":47.6419889,
        "west":-122.23183499999999,
        "north":47.704279,
        "east":-122.15385500000002
      }
    },
    "place_id":"ChIJT0vJX8ASkFQRvIA-Y7fEgIc",
    "types":["postal_code"]
  }
}
```

For more information, please visit the about the [Google Maps Geocoder API page](https://developers.google.com/maps/documentation/javascript/geocoding).

_Per Google's API policy, this function is only to be used when populating a Google Map or to create an external clickthrough to Google Maps._

#### Map Draw

```javascript
dojo.gmaps_draw(options);
```

**options**  
Type: Object  
Key/value pairs to set options

- **map_id**  
  Type: String  
  The element ID for the map.  *Required*
- **center_lat**  
  Type: Number  
  Latitude for the map's central location.  *Required*
- **center_lng**  
  Type: Number  
  Longitude for the map's central location.  *Required*
- **map_zoom**  
  Type: Number  
  The zoom level of the map. *Optional*, a bounding box is generated from the markers by default.
- **user_lat**  
  Type: Number  
  Latitude for the user's location.  Required only for the default Google Maps clickthrough.
- **user_lng**  
  Type: Number  
  Longitude for the user's location.  Required only for the default Google Maps clickthrough.
- **markers**  
  Type: Array  
  Array of Marker Objects

**Marker Object**
- **events**  
  Type: Object  
  An object that has event names for keys and callback functions for values.
- **lat**  
  Type: Number  
  Latitude for the marker location.
- **lng**  
  Type: Number  
  Longitude for the marker location.
- **clickthru**  
  Type: Object  
  Key/value pairs to set options
  - **name**  
    Type: String  
    Name of clickthrough for reporting
  - **url**  
    Type: String  
    Landing page url.  Will override default Google Maps link.
  - **callback**  
    Type: Function  
    *Optional* callback function which will run before the clickthrough.

Uses relevant data to draw out a Google Map in a specified element.

* The Map Draw function supports all of the optional marker specifications.  For more detailed information,  please visit the [Google Maps Marker API page](https://developers.google.com/maps/documentation/javascript/markers).

Example:

```javascript
var mapOptions = {
	'center_lat': 47.676308399999996,
	'center_lng': -122.20762579999999,
	'map_id': 'google_map',
	'map_zoom': 10,
	'markers': [],
}
// Assume the data variable is an object that contains location information.
for(var i in data.results){
	var numAdd = eval(i+1);
	mapOptions.markers.push({
		'lat': data.results[i].lat,
		'lng': data.results[i].lng,
		'title': data.results[i].name,
		'zIndex': numAdd,
		'clickthru': {
			'name': 'GoogleMaps',
			'url': 'http://phluant.com',
		}
	});
}
dojo.gmaps_draw(mapOptions);
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

Copyright 2016 Phluant Mobile, Inc.  All rights reserved.  This framework library is intended for use by Phluant Mobile clients for designing and developing mobile advertisements intended for eventual use in Phluant's ad serving network.  All other use is strictly prohibited.
