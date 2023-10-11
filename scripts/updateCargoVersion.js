const fs = require('fs');
const readline = require('node:readline');
const packageJson = require('../package.json');

async function updateCargoVersion() {
  const fileStream = fs.createReadStream('./Cargo.toml');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let newFile = "";
  for await (const line of rl) {
    console.log(line.replace('\\', '+'));
    if (line.startsWith("version = ")) {
      const newVersion = `version = "${packageJson.version}"`;
      newFile += newVersion + "\r\n";
      continue;
    }
    newFile += line + "\r\n";
  }

  fs.writeFileSync('./Cargo.toml', newFile);
}

async function main() {
  await updateCargoVersion();
}

main();
