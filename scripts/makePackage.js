// Functions that are to be run after the typescript compiler runs

const fs = require('fs');
const packageJson = require('../package.json');

// Copies a modified version of package.json to the /dist folder
function copyPackageJson() {
  const packageJsonCopy = { ...packageJson };
  delete packageJsonCopy.scripts;
  delete packageJsonCopy.devDependencies;
  delete packageJsonCopy.publishConfig;
  fs.writeFileSync('./temp-pkg/package.json', JSON.stringify(packageJsonCopy, null, 2));
  const parentPackageJsonCopy = {
    name: packageJsonCopy.name,
    description: packageJsonCopy.description,
    version: packageJsonCopy.version,
    keywords: packageJsonCopy.keywords,
  }
  fs.writeFileSync('./pkg/package.json', JSON.stringify(parentPackageJsonCopy, null, 2));
}

function copyReadme() {
  fs.copyFileSync('./readme.md', './temp-pkg/readme.md');
}

copyPackageJson();
copyReadme();
