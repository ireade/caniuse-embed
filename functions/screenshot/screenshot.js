const takeScreenshot = require("./take-screenshot");
const uploadScreenshot = require("./upload-screenshot");

exports.handler = async (event, context) => {

  const params = JSON.parse(event.body);
  if (!params.feature) return { statusCode: 400, body: "Feature required" };
  if (!params.periods) return { statusCode: 400, body: "Periods required" };

  const feature = params.feature;
  const periods = params.periods;
  const accessibleColours = params.accessibleColours ? (params.accessibleColours == "true") : false;

  try {
    const screenshot = await takeScreenshot(feature, periods, accessibleColours);
    const image = await uploadScreenshot(feature, screenshot);
    return { statusCode: 200, body: JSON.stringify(image) };
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
  
}
