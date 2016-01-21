$(document).ready(function() {

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

		var exportCode = '<p>Paste this snippet where you want the embed to be displayed:</p><pre>&lt;p class="ciu_embed" data-feature="'+featureID+'">\n&nbsp;&nbsp;&lt;a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'?&lt;/a&gt; Data on support for the '+featureID+' feature across the major browsers from caniuse.com.\n&lt;/p&gt;</pre>';

		var preview = '<p>Preview of embed:</p><p class="ciu_embed" data-feature="'+featureID+'">\n&nbsp;&nbsp;<a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'?</a> Data on support for the '+featureID+' feature across the major browsers from caniuse.com.\n</p>';


		$('.step_3').show();
		$('.export').html(exportCode + preview);

		// LOAD CANIUSE-EMBED.JS SCRIPT AGAIN FOR PREVIEW
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'caniuse-embed.js';
		head.appendChild(script);


		return false;
	})


})