// Generates a well-formed package.json for the /pkg folder

const fs = require('fs');
const packageJson = require('../package.json');

// Copies a modified version of package.json to the /dist folder
function copyPackageJson() {
  const packageJsonCopy = { ...packageJson };
  delete packageJsonCopy.main;
  delete packageJsonCopy.types;
  delete packageJsonCopy.scripts;
  delete packageJsonCopy.devDependencies;
  delete packageJsonCopy.publishConfig;
  fs.writeFileSync('./pkg/package.json', JSON.stringify(packageJsonCopy, null, 2));
}

function copyReadme() {
  fs.copyFileSync('./readme.md', './pkg/readme.md');
}


copyPackageJson();
copyReadme();
