const fs = require('fs');
const packageJson = require('../package.json');
const halo2WasmPackageJson = require('../../halo2-wasm/pkg/package.json');

const main = () => {
    const packageJsonCopy = { ...packageJson };
    packageJsonCopy.dependencies['@axiom-crypto/halo2-wasm'] = halo2WasmPackageJson.version;
    fs.writeFileSync('./package.json', JSON.stringify(packageJsonCopy, null, 2));
}

main();