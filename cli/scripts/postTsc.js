// Functions that are to be run after the typescript compiler runs

const fs = require('fs');
const packageJson = require('../package.json');
const { execSync } = require('child_process');

// Copies a modified version of package.json to the /dist folder
function copyPackageJson() {
    const packageJsonCopy = { ...packageJson };
    delete packageJsonCopy.scripts;
    delete packageJsonCopy.devDependencies;
    delete packageJsonCopy.publishConfig;
    packageJsonCopy.bin = {
        'halo2-wasm': './index.js',
    };
    fs.writeFileSync('./dist/package.json', JSON.stringify(packageJsonCopy, null, 2));
    const indexJs = fs.readFileSync("./dist/index.js", 'utf8');
    const withHashBang = `#!/usr/bin/env node\n${indexJs}`;
    fs.writeFileSync('./dist/index.js', withHashBang);
}

function genReadme() {
    const commands = ["mock", "keygen", "prove", "verify"];
    let readme = fs.readFileSync("./readmeTemplate.md", 'utf8');
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

function copyCircuitRunner() {
    const circuitRunner = fs.readFileSync("./src/examples/run.ts", 'utf8');
    fs.writeFileSync('./dist/run.ts', circuitRunner);
}

genReadme();
copyPackageJson();
copyCircuitRunner();
