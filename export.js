$(document).ready(function() {


	var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json';


	$.getJSON(caniuseDataUrl, function(res) {
		for (var feature in res.data) {
			var featureTitle = res.data[feature].title;
			var option = '<option value="'+feature+'">'+featureTitle+'</option>';
			$('select[name="featureID"]').append(option);
		}
	});



	$('input[type="submit"]').on('click', function() {

		var featureID = $('select[name="featureID"]').val();

		var exportCode = '<p>Paste this snippet where you want the embed to be displayed:</p><pre>&lt;p class="ciu_embed" data-feature="'+featureID+'">\n&nbsp;&nbsp;&lt;a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'&lt;/a&gt;\n&lt;/p&gt;</pre>';

		var preview = '<p>Preview of embed:</p><p class="ciu_embed" data-feature="'+featureID+'">\n&nbsp;&nbsp;<a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'</a>\n</p>';


		$('.step_3').show();
		$('.export').html(exportCode + preview);

		// LOAD CLIENT SCRIPT AGAIN FOR PREVIEW
		var head= document.getElementsByTagName('head')[0];
		var script= document.createElement('script');
		script.type= 'text/javascript';
		script.src= 'caniuse-embed.js';
		head.appendChild(script);


		return false;
	})


})