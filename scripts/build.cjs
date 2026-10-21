const fs = require('node:fs');
const path = require('node:path');
const assets = ['index.html', 'game.js', 'demo.js', 'sw.js', 'manifest.webmanifest', 'icon.svg', '.nojekyll', 'campus.js','campus3d.mjs','finishes3d.mjs','activities.js','layout.js','traffic.js','progression.js','sports.js', 'clocks.js', 'decor3d.mjs','sports3d.mjs','art3d.mjs', 'animation3d.mjs','activities3d.mjs', 'experience.js', 'core.js', 'scene.js', 'scene2d.js', 'scene3d.mjs', 'styles.css', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
fs.mkdirSync('dist', { recursive: true });
for (const file of assets) if (fs.existsSync(file)) fs.copyFileSync(file, path.join('dist', file));
fs.cpSync('vendor','dist/vendor',{recursive:true});
console.log('Static game packaged in dist/');
