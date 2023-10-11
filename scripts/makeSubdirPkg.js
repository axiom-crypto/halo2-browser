// Functions that are to be run after the typescript compiler runs

const fs = require('fs');

// Copies a modified version of package.json to the /dist folder
function deleteSubdirUnusedFiles() {
  fs.unlinkSync('./temp-pkg/package.json');
  fs.unlinkSync('./temp-pkg/README.md');
}

// deleteSubdirUnusedFiles();
