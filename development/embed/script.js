$(document).ready(function() {

	var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json';

	var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/fulldata-json/data-2.0.json';

	var featureID = location.href.split('?feat=')[1];


	var browsers = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'opera', 'ios_saf', 'op_mini', 'android', 'and_chr'];
	var periods = ['future_1', 'current', 'past_1', 'past_2'];

	function round(value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

	function getShortenedBrowserVersion(version) {
		if ( version && version.indexOf('-') > -1 ) {
			version = version.split('-')[1];
		}
		return version;
	}


	$('.default-message').html('<a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'?</a> Data on support for the '+featureID+' feature across the major browsers from caniuse.com. (Embed Loading)');


	// GET CANIUSE JSON
	$.getJSON(caniuseDataUrl, function(res) {

		//console.log(res);

		var feature = res.data[featureID];

		

		if (!feature) {

			// DISPLAY ERROR MESSAGE IF FEATURE WASN'T FOUND
			$('.feature-title').html('Uh Oh!');
			$('.feature-description').html("The feature <strong>'"+featureID+"'</strong> was not recognized. ");
			$('.feature-main').html('');

		} else {

			var global_y = feature.usage_perc_y;
			var global_a = feature.usage_perc_a;
			var global_total = global_y + global_a,
				global_total = round(global_total, 2);

			var description = feature.description;

			if ( description.length > 190 ) {
				description = description.slice(0, 180) + '....';
			}

			// DISPLAY GENERAL FEATURE INFORMATION
			$('.feature-title span').html(feature.title);
			$('.feature-description').html(description);
			$('.feature-link').attr('href', 'http://caniuse.com/#feat=' + featureID);
			$('.note').html('Global: <span class="y">'+global_y+'%</span> + <span class="a">'+global_a+'%</span> = '+global_total+'%')


			// GET BROWSER VERSIONS
			var browserVersions = {};
			for (var i = 0; i < browsers.length; i++) {
				var browser = browsers[i];

				var currentVersion = res.agents[browser].current_version;
				var currentVersionIndex;

				for (var x = 0; x < res.agents[browser].version_list.length; x++ ) {
					if ( res.agents[browser].version_list[x].era === 0 ) {
						currentVersionIndex = x;
					}
				} 

				currentVersionIndex = parseInt(currentVersionIndex);

				browserVersions[browser] = {
					future_1: res.agents[browser].version_list[currentVersionIndex + 1] ? res.agents[browser].version_list[currentVersionIndex + 1].version : null,
					current: currentVersion,
					past_1: res.agents[browser].version_list[currentVersionIndex - 1] ? res.agents[browser].version_list[currentVersionIndex - 1].version : null,
					past_2: res.agents[browser].version_list[currentVersionIndex - 2] ? res.agents[browser].version_list[currentVersionIndex - 2].version : null
				}
			}



			// GET BROWSER VERSION USAGE
			var browserUsage = {};
			for (var i = 0; i < browsers.length; i++) {
				var browser = browsers[i];

				var future_1 = browserVersions[browser].future_1;
				var future_1_usage = res.agents[browser].usage_global[future_1],
					future_1_usage = future_1_usage ? future_1_usage.toFixed(2) : 0;

				var current = browserVersions[browser].current;
				var current_usage = res.agents[browser].usage_global[current],
					current_usage = current_usage ? current_usage.toFixed(2) : 0;

				var past_1 = browserVersions[browser].past_1;
				var past_1_usage = res.agents[browser].usage_global[past_1],
					past_1_usage = past_1_usage ? past_1_usage.toFixed(2) : 0;

				var past_2 = browserVersions[browser].past_2;
				var past_2_usage = res.agents[browser].usage_global[past_2],
					past_2_usage = past_2_usage ? past_2_usage.toFixed(2) : 0;

				browserUsage[browser] = {
					future_1: future_1_usage,
					current: current_usage,
					past_1: past_1_usage,
					past_2: past_2_usage
				}
			}

	

	


			// GET DATA FOR EACH BROWSER
			var data = {};
			for (var i = 0; i < browsers.length; i++) {
				var browser = browsers[i];
				data[browser] = {
					future_1: feature.stats[browser][ browserVersions[browser].future_1 ],
					current: feature.stats[browser][ browserVersions[browser].current ],
					past_1: feature.stats[browser][ browserVersions[browser].past_1 ],
					past_2: feature.stats[browser][ browserVersions[browser].past_2 ]
				}
			}


		

			var hasPrefixed = false;
			var hasUnknown = false;

			// DISPLAY DATA
			for (var i = 0; i < browsers.length; i++) {

				var browser = browsers[i];



				// LOOP THROUGH PERIODS (BROWSER VERSIONS)
				for (var x = 0; x < periods.length; x++) {

					var period = periods[x];
					var period_element = $('tr.'+period+' td.'+browser);

					// 	ADD SUPPORT CLASS TO TABLE CELL
					data[browser][period] != undefined ? period_element.addClass(data[browser][period]) : false;

					// GET VERSION NUMBER ALONE OR VERSION NUMBER WITH BROWSER USAGE
					var browserVersion = getShortenedBrowserVersion( browserVersions[browser][period] );
					var versionString = '<span>' + browserVersion + '</span>';

					//if ( period === "current" ) {
						versionString = '<span>' + browserVersion + '</span><span class="usage">'+browserUsage[browser][period]+'%</span>';
					//} 

					// ADD VERSION NUMBER TO TABLE CELL
					browserVersions[browser][period] != undefined ? period_element.html(versionString) : period_element.html('<span></span>');


					// CHECK IF ANY HAS PREFIX OR UNKOWN

					if ( data[browser][period] != undefined && data[browser][period].indexOf('x') > -1 ) {
						hasPrefixed = true;
					}
					if ( data[browser][period] != undefined && data[browser][period].indexOf('u') > -1 ) {
						hasUnknown = true;
					}

			

				} // end loop through period

			} // end display data loop

			// DISPLAY PREFIX LEGEND IF DATA HAS PREFIXED
			hasPrefixed ? $('.legend .x').show() : $('.legend .x').hide()
			hasUnknown ? $('.legend .u').show() : $('.legend .u').hide()

		} // end else if feature

		$('.default-message').hide();
		$('.feature').show();

	}) // end get json
})