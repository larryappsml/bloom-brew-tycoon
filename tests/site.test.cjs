const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
test('JavaScript assets parse', () => {
  for (const file of ['game.js','sw.js','core.js','scene.js']) if (fs.existsSync(file)) new vm.Script(fs.readFileSync(file, 'utf8'), {filename:file});
});
test('HTML local resources exist and support the repository subpath', () => {
  const html = fs.readFileSync('index.html','utf8');
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(https?:|#|data:)/.test(url)) continue;
    assert.ok(!url.startsWith('/'), `Absolute resource: ${url}`);
    assert.ok(fs.existsSync(url.replace(/^\.\//,'')), `Missing resource: ${url}`);
  }
  const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
  assert.equal(manifest.start_url, './');
  for (const icon of manifest.icons) assert.ok(fs.existsSync(icon.src));
});
