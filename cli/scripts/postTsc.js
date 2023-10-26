// Functions that are to be run after the typescript compiler runs

const fs = require('fs');
const packageJson = require('../package.json');
const halo2WasmPackageJson = require('../../halo2-wasm/package.json');
const halo2LibJsPackageJson = require('../../halo2-lib-js/package.json');

// Copies a modified version of package.json to the /dist folder
function copyPackageJson() {
  const packageJsonCopy = { ...packageJson };
  delete packageJsonCopy.scripts;
  delete packageJsonCopy.devDependencies;
  delete packageJsonCopy.publishConfig;
  packageJsonCopy.dependencies['@axiom-crypto/halo2-wasm'] = halo2WasmPackageJson.version;
  packageJsonCopy.dependencies['@axiom-crypto/halo2-lib-js'] = halo2LibJsPackageJson.version;
  packageJsonCopy.bin = {
    'halo2-wasm': 'node index.js',
  };
  fs.writeFileSync('./dist/package.json', JSON.stringify(packageJsonCopy, null, 2));
  const indexJs = fs.readFileSync("./dist/index.js", 'utf8');
  const withHashBang = `#!/usr/bin/env node\n${indexJs}`;
  fs.writeFileSync('./dist/index.js', withHashBang);
}

function copyReadme() {
  fs.copyFileSync('./readme.md', './dist/readme.md');
}

copyPackageJson();
copyReadme();
