const sharp = require('sharp');

sharp('public/logo_m_transparent.png')
  .trim()
  .toFile('public/logo_final.png')
  .then(() => console.log('Trimmed'))
  .catch(console.error);
