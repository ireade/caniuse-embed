var caniuse_embeds = document.getElementsByClassName("ciu_embed");

function initialResizeIframe(obj) {
	setTimeout(function() {

		var iframeContentHeight = obj.contentWindow.document.body.childNodes[1].scrollHeight;
		obj.height = iframeContentHeight + 'px';

	} , 1000);
}

function doSomething(featureID, height) {


	for (var i = 0; i < caniuse_embeds.length; i++) {

		if ( caniuse_embeds[i].getAttribute('data-feature') === featureID ) {

			height+=20;

			caniuse_embeds[i].childNodes[0].height = height + 'px';
		}

	}





}

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

	return iframeHeight + 'px';

	//return '100%';
}

for (var i = 0; i < caniuse_embeds.length; i++) {
	var embed = caniuse_embeds[i];
	var feature = embed.getAttribute('data-feature');
	var periods = embed.getAttribute('data-periods'),
			periodsArray = periods.split(",");
	var iframeHeight = calcIframeHeight(embed, periodsArray.length);



	if (feature) {

		var url = 'http://caniuse.bitsofco.de/embed/index.html';
		var url = 'http://localhost:8000/embed/index.html'
		
		var iframe = '<iframe src="'+url+'?feat='+feature+'&periods='+periods+'" frameborder="0" width="100%" height="'+iframeHeight+'" style="border: 5px solid black;"></iframe>';

		embed.innerHTML = iframe;

	} else {

		embed.innerHTML = "A feature was not included. Go to <a href='http://caniuse.bitsofco.de/#how-to-use'>http://caniuse.bitsofco.de/#how-to-use</a> to generate an embed.";
	}
}

// window.onresize = function(event) {
// 	for (var i = 0; i < caniuse_embeds.length; i++) {
// 		var embed = caniuse_embeds[i];
// 		var periods = embed.getAttribute('data-periods'),
// 			periodsArray = periods.split(",");
// 		var iframeHeight = calcIframeHeight(embed, periodsArray.length);
// 		if ( iframeHeight != embed.childNodes[0].height ) {
// 			embed.childNodes[0].height = iframeHeight;
// 		}
// 	}
// };

