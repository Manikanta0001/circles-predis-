const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // White text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size/2.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', size/2, size/2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/${filename}`, buffer);
  console.log(`Created ${filename}`);
}

createIcon(192, 'icon-192x192.png');
createIcon(512, 'icon-512x512.png');
