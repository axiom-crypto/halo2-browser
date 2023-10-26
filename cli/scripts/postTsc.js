// Functions that are to be run after the typescript compiler runs

const fs = require('fs');
const packageJson = require('../package.json');
const halo2WasmPackageJson = require('../../halo2-wasm/package.json');
const { execSync } = require('child_process');

// Copies a modified version of package.json to the /dist folder
function copyPackageJson() {
    const packageJsonCopy = { ...packageJson };
    delete packageJsonCopy.scripts;
    delete packageJsonCopy.devDependencies;
    delete packageJsonCopy.publishConfig;
    packageJsonCopy.dependencies['@axiom-crypto/halo2-wasm'] = halo2WasmPackageJson.version;
    packageJsonCopy.bin = {
        'halo2-wasm': './index.js',
    };
    fs.writeFileSync('./dist/package.json', JSON.stringify(packageJsonCopy, null, 2));
    const indexJs = fs.readFileSync("./dist/index.js", 'utf8');
    const withHashBang = `#!/usr/bin/env node\n${indexJs}`;
    fs.writeFileSync('./dist/index.js', withHashBang);
}

function genReadme() {
    const commands = ["mock", "keygen", "prove", "verify"]
    let readme = `# halo2-wasm-cli\n\nSee an example circuit the CLI takes in at [src/examples/circuit.ts](./src/examples/circuit.ts)!\n\n`
    readme += "## Usage\n\n"
    const helpText = execSync("node ./dist/index.js --help").toString()
    readme += "```\n" + helpText + "```\n\n"
    readme += "## Commands\n\n"
    commands.forEach(command => {
        const helpText = execSync(`node ./dist/index.js ${command} --help`).toString()
        readme += `### ${command}\n\n`
        readme += "```\n" + helpText + "```\n\n"
    })
    fs.writeFileSync('./readme.md', readme);
    fs.writeFileSync('./dist/readme.md', readme);
}

genReadme();
copyPackageJson();
