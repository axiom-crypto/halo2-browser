// Updates package.json files that reside inside the subdirs in /pkg

const fs = require('fs');
const packageJson = require('../package.json');
const subdirPackageJson = require('../subdirPackage.json');

// Copies a modified version of package.json to the /dist folder
function copyVersion() {
  let subdirPackageJsonCopy = { ...subdirPackageJson };
  subdirPackageJsonCopy.version = packageJson.version;
  fs.writeFileSync('./temp-pkg/package.json', JSON.stringify(subdirPackageJsonCopy, null, 2));
}

function copyReadme() {
  fs.copyFileSync('./readme.md', './temp-pkg/readme.md');
}

copyVersion();
copyReadme();
