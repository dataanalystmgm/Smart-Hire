const { Jimp } = require('jimp');

async function crop() {
  try {
    const image = await Jimp.read('public/logo.png');
    
    // We'll crop out the left portion, let's assume it's roughly square (1248x1248)
    image.crop({ x: 0, y: 0, w: 1248, h: 1248 });
    
    await image.write('public/logo_m_only.png');
    console.log("Cropped successfully.");
  } catch (err) {
    console.error(err);
  }
}
crop();
