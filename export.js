$(document).ready(function() {


	var stepOne = document.getElementById('copyStepOne');
	var stepOneClipboard = new Clipboard(stepOne);

	// SORTING FUNCTION FROM http://stackoverflow.com/a/979325
	var sort_by = function(field, primer){
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

	
	$('input[value="current"]').on('click', function() {
		return false;
	})


	// GET FEATURE DATA JSON
	$.getJSON('https://raw.githubusercontent.com/Fyrd/caniuse/master/fulldata-json/data-2.0.json', function(res) {

		//console.log(res);

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

	});



	$('input[type="submit"]').on('click', function() {

		var featureID = $('select[name="featureID"]').val();

		var periods = getCheckedBoxes("periods"),
			periods = periods.join();

		var exportCode = '&lt;p class="ciu_embed" data-feature="'+featureID+'" data-periods="'+periods+'">\n&nbsp;&nbsp;&lt;a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'?&lt;/a&gt; Data on support for the '+featureID+' feature across the major browsers from caniuse.com.\n&lt;/p&gt;';


		var preview = '<p class="ciu_embed" data-feature="'+featureID+'" data-periods="'+periods+'">\n&nbsp;&nbsp;<a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'?</a> Data on support for the '+featureID+' feature across the major browsers from caniuse.com.\n</p>';


		$('.step_3').show();

		$('#stepThree').html(exportCode)
		$('.export-preview').html(preview);

		var stepThree = document.getElementById('copyStepThree');
		var stepThreeClipboard = new Clipboard(stepThree);

		// LOAD CANIUSE-EMBED.JS SCRIPT AGAIN FOR PREVIEW
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'caniuse-embed.js';
		head.appendChild(script);


		ga('send', 'event', 'button', 'click', 'generate embed');

		return false;
	})


})