/* *******************************
 *
 *   Global Variables
 *
 * ******************************* */

var OPTIONS;
/*
    OPTIONS: {
        featureID*,
        periods*,
        accessibleColours,
        imageBase,
        screenshot
    }
 */
var BROWSER_DATA;
/*
    BROWSER_DATA: {
        browserVersions: {
            chrome: {
                past_1: "80"
            }
        },
        browserUsage: {
            chrome: {
                past_1: "34.80"
            }
        }
    }
*/

var FEATURE;
/*
    FEATURE: {
        feature: {
            title*,

            description,
            usage_perc_y,
            usage_perc_a,
            global_a,

            stats[browser][BROWSER_DATA.versions[browser][period]]

            stats: {
                chrome: {

                }
            }
        }
    }
 */


var caniuseDataUrl = 'https://raw.githubusercontent.com/Fyrd/caniuse/main/fulldata-json/data-2.0.json';
var embedAPI = 'https://api.caniuse.bitsofco.de';

var BROWSERS = ['ie', 'edge', 'firefox', 'chrome', 'safari', 'ios_saf', 'op_mini', 'and_chr', 'android', 'samsung'];
var MDN_BROWSERS_KEY = {
    'ie': 'ie',
    'edge': 'edge',
    'firefox': 'firefox',
    'chrome': 'chrome',
    'safari': 'safari',
    'ios_saf': 'safari_ios',
    'op_mini': 'op_mini',
    'and_chr': 'chrome_android',
    'android': 'android',
    'samsung': 'samsunginternet_android',
};

var FEATURE_IDENTIFIERS = {
    supported: 'y',
    unsupported: 'n',
    partial: 'a',
    unknown: 'u',
    prefixed: 'x',
    flagged: 'd'
};



/* *******************************
 *
 *   Functions - Utilities
 *
 * ******************************* */

function setGlobalOptions() {

    var params = window.location.search.split("?")[1].split("&");
    var opts = {};

    params.forEach(function (param) {
        var key = param.split("=")[0];
        var value = param.split("=")[1];

        switch (key) {
            case "feat":
                opts.featureID = value;
                opts.dataSource = opts.featureID.indexOf('mdn-') === 0 ? 'mdn' : 'caniuse';
                break;
            case "periods":
                opts.periods = value.split(",");
                break;
            case "accessible-colours":
                opts.accessibleColours = value === "true";
                break;
            case "image-base":
                if (value !== 'none') opts.imageBase = value;
                break;
            case "screenshot":
                opts.screenshot = value === "true";
                break;
        }
    });

    if (!opts.periods) opts.periods = ['future_1', 'current', 'past_1', 'past_2'];

    OPTIONS = opts;
}

function getShortenedBrowserVersion(version) {
    if (version && version.indexOf('-') > -1) {
        version = version.split('-')[1];
    }
    return version;
}

function get(url) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);

        req.onload = function() {
            if (req.status === 200) {
                resolve( JSON.parse(req.response));
            } else {
                reject(Error(req.statusText));
            }
        };

        req.onerror = function() { reject(Error("Network Error")); };
        req.send();
    });
}

function post(url, body) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('POST', url, true);
        req.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        req.onload = function() {
            if (req.status === 200) {
                resolve( JSON.parse(req.response));
            } else {
                reject(Error(req.statusText));
            }
        };

        req.onerror = function() { reject(Error("Network Error")); };
        req.send( JSON.stringify(body) );
    });
}



/* *******************************
 *
 *   Functions - Get Information
 *
 * ******************************* */

function getFeature() {
    switch (OPTIONS.dataSource) {

        case 'mdn':

            var url = embedAPI + '/mdn-browser-compat-data';
            var body = { feature: OPTIONS.featureID };
            return post(url, body)
                .then(function (feature) {
                    FEATURE = Object.assign({
                        url: feature.mdn_url,
                    }, feature);

                    return getBrowserData()
                });

        case 'caniuse':

            return get(caniuseDataUrl)
                .then(function (res) {
                    FEATURE = Object.assign({
                        url: 'https://caniuse.com/#feat=' + OPTIONS.featureID,
                    }, res.data[OPTIONS.featureID]);

                    return getBrowserData(res.agents);
                });
    }
}

function getBrowserData(agents) {
    return Promise.resolve()
        .then(function () {
            if (agents) return agents;

            return get(caniuseDataUrl)
                .then(function (res) {
                    return res.agents;
                });
        })
        .then(function (a) {
            return parseBrowserData(a);
        });
}



/* *******************************
 *
 *   Functions - Parsing Data
 *
 * ******************************* */

function parseBrowserData(agents) {

    var browserVersions = {};

    for (var i = 0; i < BROWSERS.length; i++) {
        var browser = BROWSERS[i];

        // GET INDEX OF CURRENT VERSION
        var currentVersion = agents[browser].current_version;
        var currentVersionIndex;
        for (var x = 0; x < agents[browser].version_list.length; x++) {
            if (agents[browser].version_list[x].era === 0) {
                currentVersionIndex = x;
                break;
            }
        }
        currentVersionIndex = parseInt(currentVersionIndex);


        browserVersions[browser] = {};

        for (var x = 0; x < OPTIONS.periods.length; x++) {

            var period = OPTIONS.periods[x];

            if (period === 'current') {

                browserVersions[browser][period] = currentVersion;
            } else if (period.indexOf('past') > -1) {

                n = parseInt(period.split('_')[1]);
                browserVersions[browser][period] = agents[browser].version_list[currentVersionIndex - n] ? agents[browser].version_list[currentVersionIndex - n].version : null
            } else if (period.indexOf('future') > -1) {

                n = parseInt(period.split('_')[1]);
                browserVersions[browser][period] = agents[browser].version_list[currentVersionIndex + n] ? agents[browser].version_list[currentVersionIndex + n].version : null
            }


        }
    }


    var browserUsage = {};

    for (var i = 0; i < BROWSERS.length; i++) {
        var browser = BROWSERS[i];
        browserUsage[browser] = {};

        for (var x = 0; x < OPTIONS.periods.length; x++) {
            var period = OPTIONS.periods[x];

            var period_version = browserVersions[browser][period];
            var period_usage = agents[browser].usage_global[period_version];
            period_usage = period_usage ? period_usage.toFixed(2) : 0;

            browserUsage[browser][period] = period_usage;
        }
    }

    return BROWSER_DATA = {
        versions: browserVersions,
        usage: browserUsage
    };
}

function parseSupportData() {

    var browserSupport = {};

    function parseCanIUseData(browser, period) {
        browserSupport[browser][period] = FEATURE.stats[browser][BROWSER_DATA.versions[browser][period]];
    }

    function parseMDNData(browser, period) {

        if (!BROWSER_DATA.versions[browser][period]) return;

        var supportData = FEATURE.support[MDN_BROWSERS_KEY[browser]];
        if (!supportData) {
            browserSupport[browser][period] = FEATURE_IDENTIFIERS.unknown;
            return;
        }

        var this_version = BROWSER_DATA.versions[browser][period];

        function getValue(key) {
            var val;

            if (supportData[key]) {
                val = supportData[key]
            } else if (supportData[0] && supportData[0][key]) {
                val = supportData[0][key]
            } else if (supportData[1] && supportData[1][key]) {
                val = supportData[1][key]
            }

            if (val) val = val.replace(/≤/g, "");

            return val;
        }

        var version_added = getValue('version_added');
        var version_removed = getValue('version_removed');

        var isSupported = false;

        if (version_added === true) {
            isSupported = true;
        } else if (this_version === 'TP' && version_added > 0) {
            isSupported = true;
        } else if (parseFloat(this_version) >= parseFloat(version_added)) {
            isSupported = true;
        }
        if (version_removed && (parseFloat(this_version) <= parseFloat(version_removed))) {
            isSupported = false;
        }

        var supportString = isSupported ? FEATURE_IDENTIFIERS.supported :  FEATURE_IDENTIFIERS.unsupported;
        browserSupport[browser][period] = supportString;
    }

    for (var i = 0; i < BROWSERS.length; i++) {
        var browser = BROWSERS[i];

        browserSupport[browser] = {};

        for (var x = 0; x < OPTIONS.periods.length; x++) {
            var period = OPTIONS.periods[x];

            switch (OPTIONS.dataSource) {
                case 'mdn':
                    parseMDNData(browser, period);
                    break;
                case 'caniuse':
                    parseCanIUseData(browser, period);
                    break;
            }
        }
    }

    return browserSupport;
}



/* *******************************
 *
 *   Functions - Displaying Data
 *
 * ******************************* */

function displayLoadingMessage() {
    var defaultMessage;

    if (!OPTIONS.featureID) {
        defaultMessage = 'No feature ID was specified';
    } else if (OPTIONS.imageBase) {
        defaultMessage = '<picture>' +
            '<source type="image/webp" srcset="' + OPTIONS.imageBase + '.webp">' +
            '<source type="image/png" srcset="' + OPTIONS.imageBase + '.png">' +
            '<source type="image/jpeg" srcset="' + OPTIONS.imageBase + '.jpg">' +
            '<img src="' + OPTIONS.imageBase + '.png" alt="Data on support for the ' + OPTIONS.featureID + ' feature across the major browsers">' +
            '</picture>';
    } else {
        defaultMessage = 'Can I Use ' + OPTIONS.featureID + '? Data on support for the ' + OPTIONS.featureID + ' feature across the major browsers. (Embed Loading)';
    }

    document.getElementById('defaultMessage').innerHTML = defaultMessage;
}

function displayFeatureInformation() {

    document.getElementById('featureTitle').textContent = FEATURE.title;
    document.getElementById('featureLink').href = FEATURE.url;

    if (FEATURE.description) {
        var featureDescription = FEATURE.description;
        featureDescription = featureDescription.replace(/</g, "&lt;");
        featureDescription = featureDescription.replace(/>/g, "&gt;");
        featureDescription = featureDescription.replace(/&lt;code&gt;/g, "");
        featureDescription = featureDescription.replace(/&lt;\/code&gt;/g, "");
        document.getElementById('featureDescription').innerHTML = featureDescription;
    }

    if (FEATURE.usage_perc_y) {
        var global_y = FEATURE.usage_perc_y;
        var global_a = FEATURE.usage_perc_a;
        var global_total = global_y + global_a;
        global_total = global_total.toFixed(2);

        document.getElementById('note').innerHTML = 'Global: <span class="y">' + global_y + '%</span> + <span class="a">' + global_a + '%</span> = ' + global_total + '%';
    } else if (FEATURE.status) {

        if (FEATURE.status.experimental) {
            document.getElementById('note').innerHTML = '<strong>Experimental</strong> feature';
        }

        if (FEATURE.status.deprecated) {
            document.getElementById('note').innerHTML = '<strong>Deprecated</strong> feature';
        }
    }

    if (OPTIONS.accessibleColours) {
        document.body.classList.add("accessible-colours");
    }

    if (OPTIONS.screenshot) {
        document.body.classList.add("screenshot");

        var d = new Date();
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.getElementById("footer-right").innerHTML = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        document.querySelector(".icon-external-link").setAttribute("hidden", "true");
    } else {
        document.getElementById("accessibleColoursToggle").addEventListener("click", function () {
            document.body.classList.toggle("accessible-colours")
        });
    }

    switch (OPTIONS.dataSource) {
        case 'mdn':
            document.getElementById("footer-left").innerHTML = "Data from <a href=\"https://github.com/mdn/browser-compat-data\">MDN</a> | Embed from <a href=\"https://caniuse.bitsofco.de\">caniuse.bitsofco.de</a>";
            break;
        case 'caniuse':
            document.getElementById("footer-left").innerHTML = "Data from <a href=\"https://caniuse.com\">caniuse.com</a> | Embed from <a href=\"https://caniuse.bitsofco.de\">caniuse.bitsofco.de</a>";
            break;
    }

    document.body.classList.add(OPTIONS.dataSource);
}

function displayTable(featureSupport) {

    //  Create empty table cells for each browser and each period

    for (var i = OPTIONS.periods.length - 1; i > -1; i--) {

        var tableCells = "";

        for (var j = 0; j < BROWSERS.length; j++) {
            tableCells += '<td class="' + BROWSERS[j] + '"></td>';
        }

        var row = document.createElement("tr");
        row.className = 'statistics ' + OPTIONS.periods[i];
        row.innerHTML = tableCells;

        document.getElementById('tableBody').appendChild(row);
    }


    // DISPLAY DATA
    // *************************


    var hasPrefixed = false;
    var hasUnknown = false;
    var hasFlag = false;


    for (var i = 0; i < BROWSERS.length; i++) {

        var browser = BROWSERS[i];


        // LOOP THROUGH PERIODS (BROWSER VERSIONS)
        for (var x = 0; x < OPTIONS.periods.length; x++) {

            var period = OPTIONS.periods[x];
            var period_element;

            // LOOP THROUGH ROW CHILDREN TO FIND THE CURRENT TABLE CELL
            var row = document.getElementsByClassName(period)[0];
            var rowChildren = row.childNodes;
            for (var r = 0; r < rowChildren.length; r++) {
                if (rowChildren[r].className.indexOf(browser) > -1) {
                    period_element = rowChildren[r];
                }
            }


            // 	ADD SUPPORT CLASS TO TABLE CELL
            featureSupport[browser][period] != undefined ? period_element.className += ' ' + featureSupport[browser][period] : false;

            // GET VERSION NUMBER + BROWSER USAGE
            var browserVersion = getShortenedBrowserVersion(BROWSER_DATA.versions[browser][period]);
            var versionString = '<span>' + browserVersion + '</span><span class="usage">' + BROWSER_DATA.usage[browser][period] + '%</span>';

            // ADD VERSION NUMBER TO TABLE CELL
            BROWSER_DATA.versions[browser][period] != undefined ? period_element.innerHTML = versionString : period_element.innerHTML = '<span></span>';

            // CHECK IF ANY HAS PREFIX OR UNKNOWN
            if (featureSupport[browser][period] != undefined && featureSupport[browser][period].indexOf(FEATURE_IDENTIFIERS.prefixed) > -1) {
                hasPrefixed = true;
            }
            if (featureSupport[browser][period] != undefined && featureSupport[browser][period].indexOf(FEATURE_IDENTIFIERS.unknown) > -1) {
                hasUnknown = true;
            }
            if (featureSupport[browser][period] != undefined && featureSupport[browser][period].indexOf(FEATURE_IDENTIFIERS.flagged) > -1) {
                hasFlag = true;
            }


        } // end loop through period

    } // end display data loop

    // DISPLAY PREFIX LEGEND IF DATA HAS PREFIXED
    hasPrefixed ? document.getElementById('legendX').style.display = "inline-block" : document.getElementById('legendX').style.display = "none";
    hasUnknown ? document.getElementById('legendU').style.display = "inline-block" : document.getElementById('legendU').style.display = "none";
    hasFlag ? document.getElementById('legendD').style.display = "inline-block" : document.getElementById('legendD').style.display = "none";
}

function postDocumentHeight() {
    // PASS HEIGHT TO PARENT DOCUMENT
    var documentHeight = document.getElementsByClassName('feature')[0].scrollHeight;
    var infoString = 'ciu_embed:' + OPTIONS.featureID + ':' + documentHeight;
    parent.postMessage(infoString, "*");

    window.onresize = function (event) {
        documentHeight = document.getElementsByClassName('feature')[0].scrollHeight;
        var infoString = 'ciu_embed:' + OPTIONS.featureID + ':' + documentHeight;
        parent.postMessage(infoString, "*");
    }
}



/* *******************************
 *
 *   Start
 *
 * ******************************* */

(function () {

    setGlobalOptions();
    displayLoadingMessage();

    getFeature()
        .then(function () {
            return parseSupportData();
        })
        .then(function (featureSupport) {

            console.log(FEATURE);
            console.log(featureSupport);

            displayFeatureInformation();
            displayTable(featureSupport);

            document.getElementById('defaultMessage').style.display = "none";
            document.getElementsByClassName('feature')[0].style.display = "block";

            postDocumentHeight();
        })
        .catch(function (err) {
            document.getElementById('defaultMessage').innerHTML = 'Feature not found...';
            console.error(err);
        });

})();
