var caniuse_embeds = document.getElementsByClassName("ciu_embed");

function calcIframeHeight(embed, rows) {
	var parentWidth = embed.parentNode.offsetWidth; 
	var iframeHeight = 310;

	var rowHeight = 40;

	if (parentWidth < 350) {
		iframeHeight = 460;
	} 
	else if (parentWidth < 400) {
		iframeHeight = 450;
	} 
	else if (parentWidth < 500) {
		iframeHeight = 420;
	} 
	else if (parentWidth < 600) {
		iframeHeight = 390;
	}
	else if (parentWidth < 650) {
		iframeHeight = 390;
	}
	else if (parentWidth < 710) {
		iframeHeight = 370;
	}

	iframeHeight += (rowHeight * rows);

	return iframeHeight + 'px';
}

for (var i = 0; i < caniuse_embeds.length; i++) {
	var embed = caniuse_embeds[i];
	var feature = embed.getAttribute('data-feature');
	var periods = embed.getAttribute('data-periods'),
		periodsArray = periods.split(",");
	var iframeHeight = calcIframeHeight(embed, periodsArray.length);

	//console.log(periods);

	if (feature) {
		
		var iframe = '<iframe src="http://caniuse.bitsofco.de/embed/index.html?feat='+feature+'&periods='+periods+'" frameborder="0" width="100%" height="'+iframeHeight+'"></iframe>';
		embed.innerHTML = iframe;

	} else {

		embed.innerHTML = "A feature was not included. Add a caniuse feature ID to the 'data-feature' attribute of the element with class 'ciu_embed'.";
	}
}

window.onresize = function(event) {
	for (var i = 0; i < caniuse_embeds.length; i++) {
		var embed = caniuse_embeds[i];
		var periods = embed.getAttribute('data-periods'),
		periodsArray = periods.split(",");
		var iframeHeight = calcIframeHeight(embed, periodsArray.length);
		if ( iframeHeight != embed.childNodes[0].height ) {
			embed.childNodes[0].height = iframeHeight;
		}
	}
};