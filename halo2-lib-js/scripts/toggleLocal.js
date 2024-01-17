const fs = require('fs');
const packageJson = require('../package.json');

let ci = false;
if (process.argv[2] === "ci") {
    ci = true;
}
const local = ci ? "file:" : "link:";

const main = () => {
    const packageJsonCopy = { ...packageJson };
    packageJsonCopy.dependencies['@axiom-crypto/halo2-wasm'] = `${local}../halo2-wasm/pkg`;
    fs.writeFileSync('./package.json', JSON.stringify(packageJsonCopy, null, 2));
}

main();