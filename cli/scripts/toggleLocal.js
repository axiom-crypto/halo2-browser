const fs = require('fs');
const packageJson = require('../package.json');

const main = () => {
    const packageJsonCopy = { ...packageJson };
    packageJsonCopy.dependencies['@axiom-crypto/halo2-wasm'] = 'link:../halo2-wasm/pkg';
    fs.writeFileSync('./package.json', JSON.stringify(packageJsonCopy, null, 2));
}

main();