const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgBuffer = fs.readFileSync(path.join(__dirname, '../src/logo.svg'));

// Generate PNG files
Promise.all([
  sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/logo192.png')),
  sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/logo512.png')),
  // Generate favicon.ico (multiple sizes)
  sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-16.png')),
  sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-32.png')),
  sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-48.png'))
]).then(() => {
  console.log('Generated PNG files successfully');
}).catch(err => {
  console.error('Error generating PNG files:', err);
}); 