pcf = {
	ajaxRequest: null;
	isPhad: false,
	ajax: function(vars){
		if(this.ajaxRequest == null){
			this.ajaxRequest = new XMLHttpRequest(); 
		}
		var sendData = '';
		if(typeof(vars.data) != 'undefined'){
				for(var i in vars.data){
				if(sendData != ''){
					sendData += '&';
				}
				sendData += i+'='+vars.data[i];
			}
		}
		
		if(vars.type == 'GET' && sendData != ''){
			vars.url += '?'+sendData;
		}
		this.ajaxRequest.open(vars.type, vars.url, true);
		if(vars.type == 'POST'){
			this.ajaxRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			this.ajaxRequest.send(sendData);
		}
		else{
			this.ajaxRequest.send();
		}
		this.ajaxRequest.onreadystatechange = function(){
			if (this.ajaxRequest.readyState == 4 && this.ajaxRequest.status == 200) {
            	return this.ajaxRequest.responseText;
        	}
        	else{
        		return false;
        	}
		}
    	
	},
	clickthru: function(vars){
		if(this.isPhad){
			ph.u.clickthru(vars.url, vars.name, sessionID);
		}
		else{
			console.log(vars.name);
			window.open(vars.url, '_blank');
		}
	},
	contract: function(){
		if(this.isPhad){
			ph.t.close("MainPanel", sessionID);
		}
		else{
			console.log('contracting');
		}
	},
	expand: function(vars){
		if(this.isPhad){
			ph.t.expand(ph.t.expand('MainPanel', sessionID, false, {'width' : vars.width, 'height' : vars.height});
		}
		else{
			console.log('expanding to '+vars.width+'width, '+vars.height+' height.');
		}
	},
	geolocation: function(){

	},
	get_stores: function(){

	},
	gid: function(id){
		if(this.isPhad){
			return gId(id);
		}
		else{
			return document.getElementById(id);
		}
	},
	track: function(vars){
		if(this.isPhad){
			ph.u.track('interaction', 'cint='+vars.name, sessionID);
		}
		else{
			console.log(vars.name);
		}
	},
	video: function(vars){
		var videoId = vars.video_elem;
		if(typeof(videoId) == 'string'){
			videoId = this.gid(videoId);
		}
		if(this.isPhad){
			ph.v.play(vars.video_url, vars.name, campaignID, executionID, sessionID, videoId);
			if(typeof(vars.video_close_btn_hide) == true){
				phVidClose.style.display = 'none';
			}
		}
		else{
			var videoHtml = '<video id="'+video_id+'" src="'+vars.video_url+'" style="width: '+videoId.style.width+'; height: '+videoId.style.height+'; margin: 0; padding: 0"';
			if(typeof(vars.controls) == "undefined" || typeof(vars.controls)  == true){
				videoHtml += ' controls';
			}
			if(typeof(vars.inline) == true){
				videoHtml += ' webkit-playsinline';
			}
			videoHtml += '></video>';
			videoId.innerHTML = videoHtml;
		}
		ph_videoElement = videoId.getElementsByTagName('video')[0];
		if(this.isPhad){
			if(typeof(vars.controls) != "undefined" || typeof(vars.controls)  == false){
				ph_videoElement.removeAttribute('controls');
			}
			if(typeof(vars.inline) == true){
				ph_videoElement.setAttribute('webkit-playsinline', true);
			}
		}
		setTimeout(function(){
			ph_videoElement.play();
		});
		 ph_videoElement.addEventListener('ended', function(){
	        this.videoClose(videoId);
	    });
	    ph_videoElement.addEventListener('webkitendfullscreen', function(){
	        this.videoClose(videoId);
		});
	},
	videoClose: function(id){
		if(typeof(id) == 'string'){
			id = this.gid(id);
		}
		if(this.isPhad){
			ph.v.remove();
		}
		else{
			id.innerHTML = '';
		}
		
	},
}
if(typeof(ph) == 'object'){
	pcf.isPhad = true;
}