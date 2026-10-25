const { Jimp } = require('jimp');

async function removeBackground() {
  try {
    const image = await Jimp.read('public/logo.png');
    // We can just read the raw data from bitmap
    const bgR = image.bitmap.data[0];
    const bgG = image.bitmap.data[1];
    const bgB = image.bitmap.data[2];
    console.log("Background color:", {r: bgR, g: bgG, b: bgB});
    
    function colorDistance(r1, g1, b1, r2, g2, b2) {
      return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
    }

    const tolerance = 90;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      const dist = colorDistance(r, g, b, bgR, bgG, bgB);
      
      if (dist < tolerance) {
        let alpha = Math.floor(255 * (dist / tolerance));
        // Exponential smoothing for alpha looks better
        alpha = Math.floor(255 * Math.pow(dist / tolerance, 2));
        this.bitmap.data[idx + 3] = alpha; 
      }
    });

    await image.write('public/logo_transparent.png');
    console.log("Image saved as public/logo_transparent.png");
  } catch (err) {
    console.error(err);
  }
}
removeBackground();
