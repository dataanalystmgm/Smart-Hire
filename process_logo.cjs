const sharp = require('sharp');

async function process() {
  try {
    // Crop the "M" part which is on the left
    // 1248 is the height, so we'll crop a square of 1248x1248 from the left
    const image = sharp('public/original_logo.png');
    
    // Get metadata
    const metadata = await image.metadata();
    
    // We want to crop from x: 100, y: 100 with width 1000, height 1000 roughly 
    // let's just extract left 1248x1248
    await image
      .extract({ left: 0, top: 0, width: 1248, height: 1248 })
      .toFile('public/logo_m_only.png');
      
    console.log("Cropped successfully");
  } catch (e) {
    console.error(e);
  }
}
process();
