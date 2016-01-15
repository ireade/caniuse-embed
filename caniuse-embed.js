var caniuse_embeds = document.getElementsByClassName("ciu_embed");


function calcIframeHeight(embed) {

	var iframeHeight = '390px';
	var parentWidth = embed.parentNode.offsetWidth; 
	
	if (parentWidth < 1000) {
		iframeHeight = '400px';
	}
	if (parentWidth < 900) {
		iframeHeight = '440px';
	}
	if (parentWidth < 750) {
		iframeHeight = '550px';
	}
	if (parentWidth < 600) {
		iframeHeight = '600px';
	}
	return iframeHeight;
}


window.onresize = function(event) {
	for (var i = 0; i < caniuse_embeds.length; i++) {
		var embed = caniuse_embeds[i];
		var iframeHeight = calcIframeHeight(embed);
		embed.childNodes[0].height = iframeHeight;
	}
};


for (var i = 0; i < caniuse_embeds.length; i++) {
	var embed = caniuse_embeds[i];
	var feature = embed.dataset.feature;
	iframeHeight = calcIframeHeight(embed);

	if (!feature) {
		embed.innerHTML = "A feature was not included. Add a feature ID to the 'data-feature' attribute of the element with class 'ciu_embed'.";
	} else {
		var iframe = '<iframe src="src/iframe.html?feat='+feature+'" frameborder="1" width="100%" height="'+iframeHeight+'"></iframe>';
		embed.innerHTML = iframe;
	}
	
}