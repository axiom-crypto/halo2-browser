const fs = require('fs');
const readline = require('node:readline');
const packageJson = require('../package.json');

async function updateCargoVersion() {
  const fileStream = fs.createReadStream('./Cargo.toml');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let newFile = "";
  for await (const line of rl) {
    console.log(line.replace('\\', '+'));
    if (line.startsWith("version = ")) {
      const newVersion = `version = "${packageJson.version}"`;
      newFile += newVersion + "\n";
      continue;
    }
    newFile += line + "\n";
  }

  fs.writeFileSync('./Cargo.toml', newFile);
}

async function main() {
  await updateCargoVersion();
}

main();
