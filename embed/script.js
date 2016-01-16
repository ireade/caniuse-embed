$(document).ready(function() {

	var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json';
	var featureID = location.href.split('?feat=')[1];

	var currentBrowserVersionIndex = 43;

	var browsers = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'opera', 'ios_saf', 'op_mini', 'android', 'and_chr'];
	var periods = ['current', 'past_1', 'past_2', 'past_3'];

	function round(value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}



	// GET CANIUSE JSON
	$.getJSON(caniuseDataUrl, function(res) {

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
				browserVersions[browser] = {
					current: res.agents[browser].versions[currentBrowserVersionIndex],
					past_1: res.agents[browser].versions[currentBrowserVersionIndex - 1],
					past_2: res.agents[browser].versions[currentBrowserVersionIndex - 2],
					past_3: res.agents[browser].versions[currentBrowserVersionIndex - 3]
				}
			}


			// GET LATEST BROWSER VERSION USAGE
			var currentBrowserUsage = {};
			for (var i = 0; i < browsers.length; i++) {
				var browser = browsers[i];
				var current = browserVersions[browser].current;
				var rawUsage = parseInt(res.agents[browser].usage_global[current] );
				var roundedUsage = Math.round(rawUsage);
				currentBrowserUsage[browser] = roundedUsage;
			}


			// GET DATA FOR EACH BROWSER
			var data = {};
			for (var i = 0; i < browsers.length; i++) {
				var browser = browsers[i];
				data[browser] = {
					current: feature.stats[browser][ browserVersions[browser].current ],
					past_1: feature.stats[browser][ browserVersions[browser].past_1 ],
					past_2: feature.stats[browser][ browserVersions[browser].past_2 ],
					past_3: feature.stats[browser][ browserVersions[browser].past_3 ],
				}
			}
	

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
					var versionString = '<span>' + browserVersions[browser][period] + '</span>';
					if ( period === "current" ) {
						versionString = '<span>' + browserVersions[browser].current + '</span><span class="usage">'+currentBrowserUsage[browser]+'%</span>';
					} 

					// ADD VERSION NUMBER TO TABLE CELL
					browserVersions[browser][period] != undefined ? period_element.html(versionString) : period_element.html('<span></span>');

				} // end loop through period

			} // end display data loop

		} // end else if feature

		$('.feature').show();

	}) // end get json
})