var embeds = document.getElementsByClassName("ciu_embed");

var pageWidth = document.body.clientWidth;

var iframeHeight = '390px';
if (pageWidth < 1000) {
	iframeHeight = '400px';
}
if (pageWidth < 900) {
	iframeHeight = '440px';
}
if (pageWidth < 750) {
	iframeHeight = '550px';
}
if (pageWidth < 600) {
	iframeHeight = '600px';
}

for (var i = 0; i < embeds.length; i++) {
	var embed = embeds[i];
	var feature = embed.dataset.feature;

	if (!feature) {
		embed.innerHTML = "A feature was not included. Add a feature ID to the 'data-feature' attribute of the element with class 'ciu_embed'.";
	} else {
		var iframe = '<iframe src="src/iframe.html?feat='+feature+'" frameborder="0" width="100%" height="'+iframeHeight+'"></iframe>';
		embed.innerHTML = iframe;
	}
	
}