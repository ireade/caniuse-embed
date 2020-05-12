const generateEmbedButton = document.getElementById("generate-embed");

/* =====================
 * Utility functions
 * =====================*/

function getCheckedBoxes(chkboxName) {
	var checkboxes = document.getElementsByName(chkboxName);
	var checkboxesChecked = [];
	// loop over them all
	for (var i=0; i<checkboxes.length; i++) {
		// And stick the checked ones onto an array...
		if (checkboxes[i].checked) {
				checkboxesChecked.push(checkboxes[i].value);
		}
	}
	// Return the array if it is non-empty, or null
	return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}

/* =====================
 * Get list of available features for <select>
 * =====================*/

function getFeatureList() {


	$.get('http://caniuse-embed-screenshot-api.herokuapp.com/features', function(features) {

		var select = $('select[name="featureID"]');
		var options = "";

		for (var i = 0; i < features.length; i++) {
			var feature = features[i];
			options += '<option value="'+feature.id+'">'+feature.title+'</option>';
		}

		select.append(options);

		select.selectize({
			create: false,
			sortField: 'text',
			placeholder: 'Select a Feature'
		});
	});
}

/* =====================
 * Generate feature
 * =====================*/

function generatePreview(featureID, periods, accessibleColours, imageBase) {

	imageBase = imageBase || 'https://caniuse.bitsofco.de/image/' + featureID;

	var image = `<a href="http://caniuse.com/#feat=${featureID}">
		<picture>
			<source type="image/webp" srcset="${imageBase}.webp">
			<source type="image/png" srcset="${imageBase}.png">
			<img src="${imageBase}.jpg" alt="Data on support for the ${featureID} feature across the major browsers from caniuse.com">
		</picture>
	</a>`;

	if ((featureID.indexOf("mdn-") === 0)) {
		image = `<a href="http://caniuse.com/#feat=${featureID}">
			<p>Data on support for the ${featureID} feature across the major browsers from mozilla</p>
		</a>`;
	}

	if (embedType === "interactive-embed") {
		return `<p class="ciu_embed" data-feature="${featureID}" data-periods="${periods}" data-accessible-colours="${accessibleColours}">
		${image}
	</p>`;
	}

	return image;
}

function displayExportCode(preview) {
 var exportCode = preview
									.replace(/</g, "&lt;")
									.replace(/>/g, "&gt;");
	$('#stepThree').html(exportCode);

	return preview;
}

function displayPreview(preview) {

	$('.export-preview').html(preview);
	new Clipboard(document.getElementById('copyStepThree'));

	if (embedType === "interactive-embed") {
		// Load caniuse-embed.min.js again for preview
		var DOMContentLoaded_event = document.createEvent("Event");
		DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
		window.document.dispatchEvent(DOMContentLoaded_event);
	}

	return preview;
}

function generateScreenshot(feature, periods, accessibleColours) {

	const url = "https://caniuse-embed-screenshot-api.herokuapp.com/capture";
	//const url = "http://localhost:3000/capture"; // @testing

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=utf-8"
		},
		body: JSON.stringify({
			feature: feature,
			periods: periods,
			accessibleColours: accessibleColours
		})
	};

	generateEmbedButton.innerHTML = '<div aria-label="Loading" class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
	let screenshot = null;

	return fetch(url, options)
		.then((res) => res.json())
		.then((res) => screenshot = res)
		.catch((err) => console.log(err))
		.then(() => generateEmbedButton.innerHTML = 'Generate')
		.then(() => screenshot);
}

/* =====================
 * Initialise
 * =====================*/

var embedType = "interactive-embed";

new Clipboard(document.getElementById('copyStepOne'));
$('input[value="current"]').on('click', function() { return false; });

getFeatureList();

$('input[name="embed-type"]').on('change', function(e) {

	document.getElementById('step-script').setAttribute('hidden', 'hidden');
	document.getElementById('step-result').setAttribute('hidden', 'hidden');

	embedType = e.target.value;

	switch(embedType) {
		case "interactive-embed":
		case "static-image":
			document.getElementById('step-settings').removeAttribute('hidden');
			break;
		case "live-image":
			document.getElementById('step-settings').setAttribute('hidden', 'hidden');
			break;
	}
});

generateEmbedButton.addEventListener('click', function(e) {
	e.preventDefault();

	function generateInteractiveEmbed(featureID, periods, accessibleColours) {
		var preview = generatePreview(featureID, periods, accessibleColours);
		displayExportCode(preview);
		displayPreview(preview);

		document.getElementById('step-script').removeAttribute('hidden');
		document.getElementById('step-result').removeAttribute('hidden');
		ga('send', 'event', 'button', 'click', 'generate embed');
	}

	function generateLiveImage(featureID) {
		var preview = generatePreview(featureID);
		displayExportCode(preview);
		displayPreview(preview);

		document.getElementById('step-result').removeAttribute('hidden');
		ga('send', 'event', 'button', 'click', 'generate embed');
	}

	function generateStaticImage(featureID, periods, accessibleColours) {
		generateScreenshot(featureID, periods, accessibleColours)
			.then((screenshot) => {
				if (!screenshot) return console.log("Error generating screenshot");

				const splitPublicId = screenshot.public_id.split("/");
				const filename = splitPublicId[splitPublicId.length - 1];

				const imageBase = "https://caniuse.bitsofco.de/static/v1/" + filename;
				const preview = generatePreview(featureID, null, null, imageBase);
				displayExportCode(preview);
				displayPreview(preview);

				document.getElementById('step-result').removeAttribute('hidden');
				ga('send', 'event', 'button', 'click', 'generate embed')
			});
	}

	var featureID = $('select[name="featureID"]').val();
	var periods = getCheckedBoxes("periods").join();
	var accessibleColours = document.getElementById("add-accessible-colours").checked;

	if (featureID.indexOf("mdn-") === 0) embedType = "interactive-embed"; // @todo;

	switch(embedType) {
		case "interactive-embed":
			generateInteractiveEmbed(featureID, periods, accessibleColours);
			break;
		case "live-image":
			generateLiveImage(featureID);
			break;
		case "static-image":
			generateStaticImage(featureID, periods, accessibleColours);
			break;
	}

}); // end input submit
