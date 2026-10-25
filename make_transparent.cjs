const sharp = require('sharp');

async function run() {
  const { data, info } = await sharp('public/logo_m_only.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Get background color from top left pixel
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  console.log("Background color:", bgR, bgG, bgB);
  
  function distance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(Math.pow(r1-r2,2) + Math.pow(g1-g2,2) + Math.pow(b1-b2,2));
  }

  const tolerance = 90;

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const dist = distance(r, g, b, bgR, bgG, bgB);
    
    if (dist < tolerance) {
      // make it transparent
      // exponential smooth
      let alpha = Math.floor(255 * Math.pow(dist / tolerance, 2));
      if (info.channels === 4) {
        data[i + 3] = alpha;
      }
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  })
  .png()
  .toFile('public/logo_m_transparent.png');
  
  console.log("Done");
}
run();
