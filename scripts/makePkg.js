// Functions that are to be run after the typescript compiler runs

const fs = require('fs');
const packageJson = require('../package.json');

// Copies a modified version of package.json to the /dist folder
function copyPackageJson() {
  const packageJsonCopy = { ...packageJson };
  delete packageJsonCopy.scripts;
  delete packageJsonCopy.devDependencies;
  delete packageJsonCopy.publishConfig;
  fs.writeFileSync('./pkg/package.json', JSON.stringify(packageJsonCopy, null, 2));
}

function copyReadme() {
  fs.copyFileSync('./readme.md', './pkg/readme.md');
}

function copyWebTypedef() {
  fs.copyFileSync('./pkg/web/halo2_wasm.d.ts', './pkg/index.d.ts');
}

copyPackageJson();
copyReadme();
copyWebTypedef();
