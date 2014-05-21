var insert_before = document.getElementsByTagName('script')[0];
var insert_parent = insert_before.parentNode;
var onload_count = 0;
var scripts = asynchLoad.scripts;
for(var i=0; i<scripts.length; i++){
	var new_script = document.createElement('script');
	new_script.src = scripts[i];
	insert_parent.insertBefore(new_script, insert_before);
	if(scripts[i].indexOf('callback=') == -1){
		new_script.onload = function(){
			scriptLoaded();
		}
	}	
}
scriptLoaded = function(){
	onload_count++;
	console.log(onload_count);
	if(onload_count == scripts.length && typeof(asynchLoad.callback) != 'undefined'){
		console.log('about to callback');
		asynchLoad.callback();
	}
}