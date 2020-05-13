var generateEmbedButton = document.getElementById("generate-embed");
var featureSelect = $('select[name="featureID"]');
var embedAPI = 'https://caniuse-embed-screenshot-api.herokuapp.com';

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
	const url = embedAPI + '/features';
	return fetch(url)
		.then((res) => res.json())
		.then((features) => {

			var options = "";

			for (var i = 0; i < features.length; i++) {
				var feature = features[i];
				options += '<option value="'+feature.id+'">'+feature.title+'</option>';
			}

			featureSelect.append(options);

			featureSelect.selectize({
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

	var textPreview = `<p>Data on support for the ${featureID} feature across the major browsers</p>`;
	var imagePreview;

	if (!imageBase && featureID.indexOf("mdn-") !== 0) {
		imageBase = 'https://caniuse.bitsofco.de/image/' + featureID;
	}

	if (imageBase) {
		imagePreview = `<picture>
			<source type="image/webp" srcset="${imageBase}.webp">
			<source type="image/png" srcset="${imageBase}.png">
			<img src="${imageBase}.jpg" alt="Data on support for the ${featureID} feature across the major browsers from caniuse.com">
		</picture>`;
	}

	var preview = imagePreview || textPreview;

	if (embedType === "interactive-embed") {
		preview = `<p class="ciu_embed" data-feature="${featureID}" data-periods="${periods}" data-accessible-colours="${accessibleColours}">
		${imagePreview || textPreview}
	</p>`;
	}

	return preview;
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

function captureStaticScreenshot(feature, periods, accessibleColours) {

	const url = embedAPI + '/capture';

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

function setDateForStaticImage() {

    var span = document.getElementById('static-image-date');

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var d = new Date();
    var day = d.getDate();
    var month = monthNames[d.getMonth()];
    var year = d.getFullYear();

    span.textContent = '(as of ' + day + ' ' + month + ' ' + year + ')';

}

/* =====================
 * Initialise
 * =====================*/

var embedType = "interactive-embed";

new Clipboard(document.getElementById('copyStepOne'));
$('input[value="current"]').on('click', function() { return false; });

getFeatureList();

setDateForStaticImage();

featureSelect.on('change', function (e) {
    var option = e.target[0];
    var dataSource = option.value.indexOf('mdn-') === 0 ? 'mdn' : 'caniuse';
    if (dataSource === 'mdn') {
        document.querySelector('input[type="radio"][value="live-image"]').setAttribute('disabled', 'disabled');
    } else {
        document.querySelector('input[type="radio"][value="live-image"]').removeAttribute('disabled');
    }
});

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
		captureStaticScreenshot(featureID, periods, accessibleColours)
			.then((screenshot) => {
				if (!screenshot) return console.log("Error generating screenshot");
                if (!screenshot.public_id) return console.log("Error generating screenshot");

                console.log(screenshot);

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

    if (featureID.indexOf("mdn-") === 0 && embedType === "live-image") {
        embedType = "interactive-embed";
    }

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
