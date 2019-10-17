const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const takeScreenshot = async (feature, periods, accessibleColours) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: {
            width: 800,
            height: 500,
            isLandscape: true
        }
    });

    const page = await browser.newPage();

    await page.goto(
        `https://caniuse.bitsofco.de/embed/index.html?feat=${feature}&periods=${periods}&accessible-colours=${accessibleColours}`,
        { waitUntil: 'networkidle2' }
    );

    const screenshot = await page.screenshot({
        omitBackground: true,
        encoding: 'binary'
    });

    await browser.close();

    return screenshot;
};

const uploadScreenshot = (feature, screenshot) => {
    return new Promise((resolve, reject) => {

        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();
        const date = `${yyyy}-${mm}-${dd}`;

        const options = {
            folder: 'caniuse-embed',
            public_id: `${feature}-${date}`
        };

        cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error)
            else resolve(result);
        }).end(screenshot);
    });
}

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
