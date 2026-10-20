const fs = require('node:fs');
const path = require('node:path');
const assets = ['index.html', 'game.js', 'sw.js', 'manifest.webmanifest', 'icon.svg', '.nojekyll', 'core.js', 'scene.js', 'styles.css', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
fs.mkdirSync('dist', { recursive: true });
for (const file of assets) if (fs.existsSync(file)) fs.copyFileSync(file, path.join('dist', file));
console.log('Static game packaged in dist/');
