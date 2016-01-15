$(document).ready(function() {

	var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/data.json';
	var featureID = location.href.split('?feat=')[1];

	var currentBrowserVersionIndex = 43;

	var browsers = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'opera', 'ios_saf', 'op_mini', 'android', 'and_chr'];


	// GET CANIUSE JSON
	$.getJSON(caniuseDataUrl, function(res) {

		var feature = res.data[featureID];

		if (!feature) {

			// DISPLAY ERROR MESSAGE IF FEATURE WASN'T FOUND
			$('.feature-title').html('Uh Oh!');
			$('.feature-description').html("The feature <strong>'"+featureID+"'</strong> was not recognized. ");
			$('.feature-main').html('');

		} else {


			// DISPLAY GENERAL FEATURE INFORMATION
			$('.feature-title span').html(feature.title);
			$('.feature-description').html(feature.description);
			$('.feature-link').attr('href', 'http://caniuse.com/#feat=' + featureID)


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

				// GET CELL
				var current = $('tr.current td.'+browser);

				// 	ADD SUPPORT CLASS TO TABLE CELL
				data[browser].current != undefined ? current.addClass(data[browser].current) : false;

				// ADD VERSION NUMBER TO TABLE CELL
				browserVersions[browser].current != undefined ? current.html('<span>' + browserVersions[browser].current + '</span><span class="usage">'+currentBrowserUsage[browser]+'%</span>') : current.html('<span></span>');


				// REPEAT FOR PAST 

				var past_1 = $('tr.past_1 td.'+browser);
				data[browser].past_1 != undefined ? past_1.addClass(data[browser].past_1) : false;
				browserVersions[browser].past_1 != undefined ? past_1.html('<span>' + browserVersions[browser].past_1 + '</span>') : past_1.html('<span></span>');

				var past_2 = $('tr.past_2 td.'+browser);
				data[browser].past_2 != undefined ? past_2.addClass(data[browser].past_2) : false;
				browserVersions[browser].past_2 != undefined ? past_2.html('<span>' + browserVersions[browser].past_2 + '</span>') : past_2.html('<span></span>');

				var past_3 = $('tr.past_3 td.'+browser);
				data[browser].past_3 != undefined ? past_3.addClass(data[browser].past_3) : false;
				browserVersions[browser].past_3 != undefined ? past_3.html('<span>' + browserVersions[browser].past_3 + '</span>') : past_3.html('<span></span>')

			} // end display data


		} // end else if feature
	}) // end get json
})