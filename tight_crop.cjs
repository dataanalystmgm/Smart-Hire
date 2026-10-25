const { Jimp } = require('jimp');

async function crop() {
  try {
    const image = await Jimp.read('public/logo_m_only.png');
    
    // We can use Jimp's autocrop
    image.autocrop();
    
    await image.write('public/logo_m_only.png');
    console.log("Autocropped successfully.");
  } catch (err) {
    console.error(err);
  }
}
crop();
