var insert_before = document.getElementsByTagName('script')[0];
var insert_parent = insert_before.parentNode;
var new_script = document.createElement('script');
new_script.src = 'http://mdn4.phluantmobile.net/jslib/dojo_js/dojo.min.js';
insert_parent.insertBefore(new_script, insert_before);
new_script.onload = function(){
	preInit();
};