const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const svgBuffer = fs.readFileSync('icon.svg');

  console.log('🎨 Generating PWA icons...');

  try {
    // Generate 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile('icon-192.png');
    console.log('✅ Created icon-192.png (192x192)');

    // Generate 512x512 icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile('icon-512.png');
    console.log('✅ Created icon-512.png (512x512)');

    // Generate favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('favicon.png');
    console.log('✅ Created favicon.png (32x32)');

    // Generate Apple touch icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile('apple-touch-icon.png');
    console.log('✅ Created apple-touch-icon.png (180x180)');

    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\n📱 Your app is now ready to be installed as a PWA!');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons();
