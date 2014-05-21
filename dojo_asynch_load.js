var insert_array = ['http://mdn4.phluantmobile.net/jslib/dojo_js/dojo.min.js']
var insert_before = document.getElementsByClassName('holder')[0];
console.log(insert_before.getAttribute('data-script'));
insert_array.push(insert_before.getAttribute('data-script'));
var insert_parent = insert_before.parentNode;
var onload_count = 0;
for(var i=0; i<insert_array.length; i++){
	var new_script = document.createElement('script');
	new_script.src = insert_array[i];
	insert_parent.insertBefore(new_script, insert_before);
	new_script.onload = function(){
		onload_count++;
		if(onload_count = insert_array.length){
			preInit();
		}
	};
}
