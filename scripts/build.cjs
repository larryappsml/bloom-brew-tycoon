const fs = require('node:fs');
const path = require('node:path');
const assets = ['index.html', 'game.js', 'sw.js', 'manifest.webmanifest', 'icon.svg', '.nojekyll', 'layout.js','traffic.js','progression.js', 'clocks.js', 'decor3d.mjs', 'core.js', 'scene.js', 'scene2d.js', 'scene3d.mjs', 'styles.css', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
fs.mkdirSync('dist', { recursive: true });
for (const file of assets) if (fs.existsSync(file)) fs.copyFileSync(file, path.join('dist', file));
fs.cpSync('vendor','dist/vendor',{recursive:true});
console.log('Static game packaged in dist/');
