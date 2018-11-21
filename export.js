
/* =====================
 * Utility functions
 * =====================*/

// SORTING FUNCTION FROM http://stackoverflow.com/a/979325
function sort_by(field, primer){
	var key = primer ? 
			function(x) {return primer(x[field])} : 
			function(x) {return x[field]};
	return function (a, b) {
			return a = key(a), b = key(b), 1 * ((a > b) - (b > a));
		} 
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Pass the checkbox name to the function
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
	$.getJSON('https://raw.githubusercontent.com/Fyrd/caniuse/master/fulldata-json/data-2.0.json', function(res) {

		var featuresArray = [];
		for (var feature in res.data) {
			var featureTitle = res.data[feature].title;
			featureTitle = capitalizeFirstLetter(featureTitle);
			var feature = {
				id: feature,
				title: featureTitle
			}
			featuresArray.push(feature);
		}
		featuresArray.sort(sort_by('title', function(a){return a}));

		for (var i = 0; i < featuresArray.length; i++) {
			var feature = featuresArray[i];
			var option = '<option value="'+feature.id+'">'+feature.title+'</option>';
			$('select[name="featureID"]').append(option);
		}

		$('select[name="featureID"]').selectize({
			create: false,
			sortField: 'text',
			placeholder: 'Select a Feature'
		});
	});
}

/* =====================
 * Generate feature
 * =====================*/

function generatePreview(featureID, periods, accessibleColours, screenshot) {

	console.log(screenshot);

	return '<p class="ciu_embed" data-feature="'+featureID+'" data-periods="'+periods+'" data-accessible-colours="'+accessibleColours+'">\n&nbsp;&nbsp;<a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'?</a> Data on support for the '+featureID+' feature across the major browsers from caniuse.com.\n</p>';
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

	// Load caniuse-embed.min.js again for preview
	var DOMContentLoaded_event = document.createEvent("Event");
	DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
	window.document.dispatchEvent(DOMContentLoaded_event);

	return preview;
}

function generateScreenshot(feature, periods, accessibleColours) {
	console.log(feature, periods, accessibleColours);
	var url = 'https://caniuse.bitsofco.de/embed/index.html?feat='+feature+'&periods='+periods+'&accessible-colours='+accessibleColours;

	return "screenshot";
}

/* =====================
 * Initialise
 * =====================*/

new Clipboard(document.getElementById('copyStepOne'));
$('input[value="current"]').on('click', function() { return false; });

getFeatureList();

document.getElementById('generate-embed').addEventListener('click', function(e) {
	e.preventDefault();

	var featureID = $('select[name="featureID"]').val();
	var periods = getCheckedBoxes("periods").join();
	var accessibleColours = document.getElementById("add-accessible-colours").checked;
	var fallbackScreenshot = document.getElementById("fallback-screenshot").checked;

	var start = Promise.resolve();
	if (fallbackScreenshot) start = generateScreenshot(featureID, periods, accessibleColours);

	start
		.then((screenshot) => generatePreview(featureID, periods, accessibleColours, screenshot))
		.then((preview) => displayExportCode(preview))
		.then((preview) => displayPreview(preview))
	
	$('.step_3').show();

	ga('send', 'event', 'button', 'click', 'generate embed');
}); // end input submit
