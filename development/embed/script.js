
// DEFINE VARIABLES
// *************************

var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/fulldata-json/data-2.0.json';
var featureID = location.href.split('?feat=')[1];

var browsers = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'opera', 'ios_saf', 'op_mini', 'android', 'and_chr'];
var periods = ['future_1', 'current', 'past_1', 'past_2'];



// DEFINE FUNCTIONS
// *************************

function getShortenedBrowserVersion(version) {
	if ( version && version.indexOf('-') > -1 ) {
		version = version.split('-')[1];
	}
	return version;
}
function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}


// SET DEFAULT MESSAGE OF EMBED LOADING
document.getElementById('defaultMessage').innerHTML = '<a href="http://caniuse.com/#feat='+featureID+'">Can I Use '+featureID+'?</a> Data on support for the '+featureID+' feature across the major browsers from caniuse.com. (Embed Loading)';



// GET CANIUSE JSON
// *************************

loadJSON(caniuseDataUrl, function(res) { 

	//console.log(res);
	var feature = res.data[featureID];
	
	if (feature) {

		var global_y = feature.usage_perc_y;
		var global_a = feature.usage_perc_a;
		var global_total = global_y + global_a,
			global_total = global_total.toFixed(2);

		var description = feature.description;

		if ( description.length > 190 ) {
			description = description.slice(0, 180) + '....';
		}




		// DISPLAY GENERAL FEATURE INFORMATION
		// *************************

		document.getElementById('featureTitle').innerHTML = feature.title;
		document.getElementById('featureDescription').innerHTML = description;
		document.getElementById('featureLink').href = 'http://caniuse.com/#feat=' + featureID;
		document.getElementById('note').innerHTML = 'Global: <span class="y">'+global_y+'%</span> + <span class="a">'+global_a+'%</span> = '+global_total+'%';






		// GET BROWSER VERSIONS
		// *************************

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



		// GET BROWSER VERSIONS USAGE
		// *************************

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
		// *************************

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
		// *************************

		for (var i = 0; i < browsers.length; i++) {

			var browser = browsers[i];


			// LOOP THROUGH PERIODS (BROWSER VERSIONS)
			for (var x = 0; x < periods.length; x++) {

				var period = periods[x];
				var period_element;

				// LOOP THROUGH ROW CHILDREN TO FIND THE CURRENT TABLE CELL
				var row = document.getElementsByClassName(period)[0];
				var rowChildren = row.childNodes;
				for ( var r = 0; r < rowChildren.length; r++ ) {
					if ( rowChildren[r].className.indexOf(browser) > -1) {
						period_element = rowChildren[r];
					}
				} 


				// 	ADD SUPPORT CLASS TO TABLE CELL
				data[browser][period] != undefined ? period_element.className += ' '+data[browser][period] : false;

				// GET VERSION NUMBER ALONE OR VERSION NUMBER WITH BROWSER USAGE
				var browserVersion = getShortenedBrowserVersion( browserVersions[browser][period] );
				var versionString = '<span>' + browserVersion + '</span><span class="usage">'+browserUsage[browser][period]+'%</span>';

				// ADD VERSION NUMBER TO TABLE CELL
				browserVersions[browser][period] != undefined ? period_element.innerHTML = versionString : period_element.innerHTML = '<span></span>';

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
		hasPrefixed ? document.getElementById('legendX').style.display = "inline-block" : document.getElementById('legendX').style.display = "none";
		hasUnknown ? document.getElementById('legendU').style.display = "inline-block" : document.getElementById('legendU').style.display = "none";

	} else {

		// IF NO FEATURE FOUND
		// *************************

		// DISPLAY ERROR MESSAGE IF FEATURE WASN'T FOUND
		document.getElementById('featureTitle').innerHTML = 'Uh Oh!';
		document.getElementById('featureDescription').innerHTML = "The feature <strong>'"+featureID+"'</strong> was not recognized. ";
		document.getElementById('featureMain').innerHTML = '';
	}


	// AFTER EVERYTHING HAS LOADED, SHOW FEATURE AND HIDE DEFAULT MESSAGE
	document.getElementById('defaultMessage').style.display = "none";
	document.getElementsByClassName('feature')[0].style.display = "block";

}, function(xhr) { 

	// IF ERROR GETTING JSON FILE
	// *************************

	document.getElementById('defaultMessage').innerHTML = 'Error Getting JSON File: ' + xhr.response;
	console.error(xhr); 
});	