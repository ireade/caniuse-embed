var caniuse_embeds = document.getElementsByClassName("ciu_embed");

function calcIframeHeight(embed) {
	var parentWidth = embed.parentNode.offsetWidth; 
	var iframeHeight = '390px';

	if (parentWidth < 600) {
		iframeHeight = '630px';
	}
	else if (parentWidth < 750) {
		iframeHeight = '550px';
	}
	else if (parentWidth < 900) {
		iframeHeight = '440px';
	}
	else if (parentWidth < 1000) {
		iframeHeight = '400px';
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