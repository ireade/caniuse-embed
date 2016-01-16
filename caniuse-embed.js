var caniuse_embeds = document.getElementsByClassName("ciu_embed");

function calcIframeHeight(embed) {
	var parentWidth = embed.parentNode.offsetWidth; 
	var iframeHeight = '480px';

	if (parentWidth < 400) {
		iframeHeight = '690px';
	} 
	else if (parentWidth < 500) {
		iframeHeight = '650px';
	} 
	else if (parentWidth < 600) {
		iframeHeight = '590px';
	}
	else if (parentWidth < 700) {
		iframeHeight = '560px';
	}

	return iframeHeight;
}

for (var i = 0; i < caniuse_embeds.length; i++) {
	var embed = caniuse_embeds[i];
	var feature = embed.dataset.feature;
	var iframeHeight = calcIframeHeight(embed);

	if (!feature) {
		embed.innerHTML = "A feature was not included. Add a caniuse feature ID to the 'data-feature' attribute of the element with class 'ciu_embed'.";
	} else {
		var iframe = '<iframe src="https://caniuse.bitsofco.de/embed/index.html?feat='+feature+'" frameborder="0" width="100%" height="'+iframeHeight+'"></iframe>';
		embed.innerHTML = iframe;
	}
}

window.onresize = function(event) {
	for (var i = 0; i < caniuse_embeds.length; i++) {
		var embed = caniuse_embeds[i];
		var iframeHeight = calcIframeHeight(embed);
		embed.childNodes[0].height = iframeHeight;
	}
};