// DEFINE VARIABLES
// *************************

//document.domain = '*.*';

// window.parent.doSomething();

// var t = window.innerHeight;





// window.onresize = function(event) {
// 	window.parent.doSomething('100px');
// }





var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/fulldata-json/data-2.0.json';

var featureID = location.href.split('?feat=')[1],
	featureID = featureID.split('&periods=')[0];

var periods = location.href.split('&periods=')[1],
	periods = periods.split(",");

var browsers = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'opera', 'ios_saf', 'op_mini', 'android', 'and_chr'];




// ADD TABLE ROWS FOR EACH PERIOD
// *************************

for (var i = periods.length - 1; i > -1; i--) {

	var tableCells = '<td class="ie"></td><td class="edge"></td><td class="firefox"></td><td class="chrome"></td><td class="safari"></td><td class="opera"></td><td class="ios_saf"></td><td class="op_mini"></td><td class="android"></td><td class="and_chr"></td>';

	var row = document.createElement("tr");
	row.className = 'statistics '+periods[i];
	row.innerHTML = tableCells;

	document.getElementById('tableBody').appendChild(row);
}



// DEFINE FUNCTIONS
// *************************

function getShortenedBrowserVersion(version) {
	if ( version && version.indexOf('-') > -1 ) {
		version = version.split('-')[1];
	}
	return version;
}
function loadJSON(path, success, error) {
	// Function from: http://stackoverflow.com/a/18278346
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

			// GET INDEX OF CURRENT VERSION
			var currentVersion = res.agents[browser].current_version;
			var currentVersionIndex;
			for (var x = 0; x < res.agents[browser].version_list.length; x++ ) {
				if ( res.agents[browser].version_list[x].era === 0 ) {
					currentVersionIndex = x;
					break;
				}
			} 
			currentVersionIndex = parseInt(currentVersionIndex);


			browserVersions[browser] = {};

			for (var x = 0; x < periods.length; x++) {

				var period = periods[x];

				if ( period === 'current' ) {

					browserVersions[browser][period] = currentVersion;
				}

				else if ( period.indexOf('past') > -1 ) {

					n = parseInt(period.split('_')[1]);
					browserVersions[browser][period] = res.agents[browser].version_list[currentVersionIndex - n] ? res.agents[browser].version_list[currentVersionIndex - n].version : null
				}

				else if ( period.indexOf('future') > -1 ) {

					n = parseInt(period.split('_')[1]);
					browserVersions[browser][period] = res.agents[browser].version_list[currentVersionIndex + n] ? res.agents[browser].version_list[currentVersionIndex + n].version : null
				}


			} // end for periods
		} // end get browser versions



		// GET BROWSER VERSIONS USAGE
		// *************************

		var browserUsage = {};
		for (var i = 0; i < browsers.length; i++) {

			var browser = browsers[i];
			browserUsage[browser] = {};

			for (var x = 0; x < periods.length; x++) {

				var period = periods[x];

				var period_version = browserVersions[browser][period];
				var period_usage = res.agents[browser].usage_global[period_version],
					period_usage = period_usage ? period_usage.toFixed(2) : 0;

				browserUsage[browser][period] = period_usage;

			} // end for periods
		} // end get browser usages





		// GET DATA FOR EACH BROWSER
		// *************************

		var data = {};
		for (var i = 0; i < browsers.length; i++) {

			var browser = browsers[i];
			data[browser] = {};

			for (var x = 0; x < periods.length; x++) {
				var period = periods[x];
				data[browser][period] = feature.stats[browser][ browserVersions[browser][period] ];
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

				// GET VERSION NUMBER + BROWSER USAGE
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


	var featureHeight = document.getElementsByClassName('feature')[0].scrollHeight;

	

	window.parent.doSomething(featureID, featureHeight);

	window.onresize = function(event) {

		var featureHeight = document.getElementsByClassName('feature')[0].scrollHeight;
		//console.log(featureHeight);
		window.parent.doSomething(featureID, featureHeight);
	}


}, function(xhr) { 

	// IF ERROR GETTING JSON FILE
	// *************************

	document.getElementById('defaultMessage').innerHTML = 'Error Getting JSON File: ' + xhr.response;
	console.error(xhr); 
});	


