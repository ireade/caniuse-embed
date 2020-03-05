/* ******************************* 
 *  Global Variabls
 * ******************************* */

var options;
var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/fulldata-json/data-2.0.json';
var browsers = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'ios_saf', 'op_mini', 'and_chr', 'android', 'samsung'];


/* ******************************* 
 *  Functions
 * ******************************* */

function parseQueryParams() {

  var params = window.location.search.split("?")[1].split("&");
  var result = {};

  params.forEach(function(param) {
    var key = param.split("=")[0];
    var value = param.split("=")[1];
  
    switch(key) {
      case "feat":
        result.featureID = value;
        break;
      case "periods":
        result.periods = value.split(",");
        break;
      case "accessible-colours":
        result.accessibleColours = value == "true" ? true : false;
        break;
      case "image-base":
        if (value !== 'none') result.imageBase = value;
        break;
      case "screenshot":
        result.screenshot = value == "true" ? true : false;
        break;
    }
  });

  return result;
}

function setDefaultLoadingMessage() {

  var defaultMessage;

  if (!options.featureID) {
    defaultMessage = 'Error: Feature not specified';
  }

  else if (options.imageBase) {
    defaultMessage = '<picture>'+
      '<source type="image/webp" srcset="' + options.imageBase + '.webp">' +
      '<source type="image/png" srcset="' + options.imageBase + '.png">' +
      '<source type="image/jpeg" srcset="' + options.imageBase + '.jpg">' +
      '<img src="' + options.imageBase + '.png" alt="Data on support for the ' + options.featureID + ' feature across the major browsers from caniuse.com">' +
    '</picture>';
  } 
  
  else {
    defaultMessage = '<a href="https://caniuse.com/#feat='+options.featureID+'">Can I Use '+options.featureID+'?</a> Data on support for the '+options.featureID+' feature across the major browsers from caniuse.com. (Embed Loading)';
  }
  
  document.getElementById('defaultMessage').innerHTML = defaultMessage;
}

function getShortenedBrowserVersion(version) {
  if ( version && version.indexOf('-') > -1 ) {
    version = version.split('-')[1];
  }
  return version;
}

function fetchCanIUseData(success, error) {
  // Function from: https://stackoverflow.com/a/18278346
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
    xhr.open("GET", caniuseDataUrl, true);
    xhr.send();
}


// **************************************************************************************************


(function() {

  // 1 - Get params

  options = parseQueryParams();
  if (!options.periods) options.periods = ['future_1', 'current', 'past_1', 'past_2'];

  // 2 - Set default message while embed loads

  setDefaultLoadingMessage();

  




// **************************************************************************************************



  // ADD TABLE ROWS FOR EACH PERIOD
  // *************************

  for (var i = options.periods.length - 1; i > -1; i--) {

    var tableCells = "";

    for (var j = 0; j < browsers.length; j++) {
      tableCells += '<td class="' + browsers[j] + '"></td>';
    }

    var row = document.createElement("tr");
    row.className = 'statistics '+options.periods[i];
    row.innerHTML = tableCells;

    document.getElementById('tableBody').appendChild(row);
  }


  // GET CANIUSE JSON
  // *************************

  fetchCanIUseData(function(res) { 
    
    var feature = res.data[options.featureID];
    
    if (feature) {

      var global_y = feature.usage_perc_y;
      var global_a = feature.usage_perc_a;
      var global_total = global_y + global_a,
        global_total = global_total.toFixed(2);


      // DISPLAY GENERAL FEATURE INFORMATION
      // *************************

      // HTML Encoding for special characters
      var featureDescription = feature.description;
        featureDescription = featureDescription.replace(/</g, "&lt;");
        featureDescription = featureDescription.replace(/>/g, "&gt;");

      document.getElementById('featureTitle').innerHTML = feature.title;
      document.getElementById('featureDescription').innerHTML = featureDescription;
      document.getElementById('featureLink').href = 'http://caniuse.com/#feat=' + options.featureID;
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

        for (var x = 0; x < options.periods.length; x++) {

          var period = options.periods[x];

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

        for (var x = 0; x < options.periods.length; x++) {

          var period = options.periods[x];

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

        for (var x = 0; x < options.periods.length; x++) {
          var period = options.periods[x];
          data[browser][period] = feature.stats[browser][ browserVersions[browser][period] ];
        }


      }


    

      var hasPrefixed = false;
      var hasUnknown = false;
      var hasFlag = false;

      // DISPLAY DATA
      // *************************

      for (var i = 0; i < browsers.length; i++) {

        var browser = browsers[i];


        // LOOP THROUGH PERIODS (BROWSER VERSIONS)
        for (var x = 0; x < options.periods.length; x++) {

          var period = options.periods[x];
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
          if ( data[browser][period] != undefined && data[browser][period].indexOf('d') > -1 ) {
            hasFlag = true;
          }


        } // end loop through period

      } // end display data loop

      // DISPLAY PREFIX LEGEND IF DATA HAS PREFIXED
      hasPrefixed ? document.getElementById('legendX').style.display = "inline-block" : document.getElementById('legendX').style.display = "none";
      hasUnknown ? document.getElementById('legendU').style.display = "inline-block" : document.getElementById('legendU').style.display = "none";
      hasFlag ? document.getElementById('legendD').style.display = "inline-block" : document.getElementById('legendD').style.display = "none";

    } else {

      // IF NO FEATURE FOUND
      // *************************

      // DISPLAY ERROR MESSAGE IF FEATURE WASN'T FOUND
      document.getElementById('featureTitle').innerHTML = 'Uh Oh!';
      document.getElementById('featureDescription').innerHTML = "The feature <strong>'"+options.featureID+"'</strong> was not recognized. ";
      document.getElementById('featureMain').innerHTML = '';
    }


    // AFTER EVERYTHING HAS LOADED, SHOW FEATURE AND HIDE DEFAULT MESSAGE
    document.getElementById('defaultMessage').style.display = "none";
    document.getElementsByClassName('feature')[0].style.display = "block";


    // PASS HEIGHT TO PARENT DOCUMENT
    var documentHeight = document.getElementsByClassName('feature')[0].scrollHeight;
    var infoString = 'ciu_embed:' + options.featureID + ':' + documentHeight;
    parent.postMessage(infoString,"*");

    window.onresize = function(event) {
      documentHeight = document.getElementsByClassName('feature')[0].scrollHeight;
      var infoString = 'ciu_embed:' + options.featureID + ':' + documentHeight;
      parent.postMessage(infoString,"*");
    } 



  }, function(xhr) { 

    // IF ERROR GETTING JSON FILE
    // *************************

    document.getElementById('defaultMessage').innerHTML = 'Error Getting JSON File: ' + xhr.response;
    console.error(xhr); 
    
  });	// end loadJSON


  // TOGGLE ACCESSIBLE COLOURS
  // *************************

  if (options.accessibleColours) {
    document.body.classList.add("accessible-colours");
  }

  if (!options.screenshot) {
    document.getElementById("accessibleColoursToggle").addEventListener("click", function() {
      document.body.classList.toggle("accessible-colours")
    });
  }

  
  // DATE FOR SCREENSHOT
  // *************************

  if (options.screenshot) {

    document.body.classList.add("screenshot");

    var d = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("footer-right").innerHTML = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  
    document.getElementById("footer-left").innerHTML = "Data from caniuse.com | Embed from caniuse.bitsofco.de";
    document.querySelector(".icon-external-link").setAttribute("hidden", "true");
  }


})();
