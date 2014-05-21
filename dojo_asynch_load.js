var insert_before = document.getElementsByTagName('script')[0];
var insert_parent = insert_before.parentNode;
var onload_count = 0;
for(var i=0; i<scripts.length; i++){
	var new_script = document.createElement('script');
	new_script.src = scripts[i];
	insert_parent.insertBefore(new_script, insert_before);
	new_script.onload = function(){
		onload_count++;
		if(onload_count = scripts.length){
			preInit();
		}
	};
}
