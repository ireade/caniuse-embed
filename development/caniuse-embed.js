function resizeIframe(obj) {
obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

var caniuse_embeds = document.getElementsByClassName("ciu_embed");

function calcIframeHeight(embed, rows) {
	var parentWidth = embed.parentNode.offsetWidth; 
	var rowHeight = 40; // height of each row

	var iframeHeight = 310; // default Iframe Height for large screens

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
		iframeHeight = 400;
	}
	else if (parentWidth < 650) {
		iframeHeight = 390;
	}
	else if (parentWidth < 710) {
		iframeHeight = 370;
	}

	iframeHeight += (rowHeight * rows);

	//return iframeHeight + 'px';

	return '';
}

for (var i = 0; i < caniuse_embeds.length; i++) {
	var embed = caniuse_embeds[i];
	var feature = embed.getAttribute('data-feature');
	var periods = embed.getAttribute('data-periods'),
			periodsArray = periods.split(",");
	var iframeHeight = calcIframeHeight(embed, periodsArray.length);

	if (feature) {
		
		var iframe = '<iframe src="http://caniuse.bitsofco.de/embed/index.html?feat='+feature+'&periods='+periods+'" frameborder="0" width="100%" scrolling="no" onload="resizeIframe(this)"></iframe>';
		embed.innerHTML = iframe;

	} else {

		embed.innerHTML = "A feature was not included. Go to <a href='http://caniuse.bitsofco.de/#how-to-use'>http://caniuse.bitsofco.de/#how-to-use</a> to generate an embed.";
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