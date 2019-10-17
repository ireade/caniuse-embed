const puppeteer = require('puppeteer');

module.exports = async (feature, periods, accessibleColours) => {
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
}
