import * as ts from 'typescript';
import * as vm from 'vm';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DEFAULT_CIRCUIT_CONFIG } from '@axiom-crypto/halo2-wasm/shared';
import { execSync } from 'child_process';

export async function getFunctionFromTs(relativePath: string, shouldCircuitFunctionExist = true) {
    const code = fs.readFileSync(path.resolve(relativePath), 'utf8');
    const result = ts.transpileModule(code, {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
    });
    const script = new vm.Script(result.outputText);
    const customRequire = (moduleName: string) => {
        try {
            if (moduleName === "@axiom-crypto/halo2-lib-js") {
                return require("@axiom-crypto/halo2-lib-js");
            }
            else {
                const npmRoot = execSync('npm root').toString().trim();
                return require(`${npmRoot}/${moduleName}`);
            }
        } catch (e) {
            throw new Error(`Cannot find module '${moduleName}'.\n Try installing it globally with 'npm install -g ${moduleName}'`);
        }
    };
    const context = vm.createContext({
        exports: {},
        require: customRequire,
        module: module,
        console: console,
        __filename: __filename,
        __dirname: __dirname,
    });
    script.runInContext(context);
    if (shouldCircuitFunctionExist && !context.exports.circuit) throw new Error("File does not export a `circuit` function");
    let config = DEFAULT_CIRCUIT_CONFIG;
    let inputs = undefined;
    if (context.exports.config) config = context.exports.config;
    if (context.exports.inputs) inputs = context.exports.inputs;
    return {
        circuit: context.exports.circuit,
        config,
        inputs,
    };
}

export async function getRunCircuitFromTs(relativePath: string | undefined) {
    const home = os.homedir();
    const halo2WasmRunnerPath = path.join(home, '.halo2-wasm', 'run.ts');
    const folderPath = path.dirname(halo2WasmRunnerPath);
    if (!relativePath) {
        relativePath = halo2WasmRunnerPath;
    }
    const exists = fs.existsSync(path.resolve(relativePath));
    if (!exists) {
        const run = fs.readFileSync(path.resolve(__dirname, 'run.ts'), 'utf8');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        fs.writeFileSync(halo2WasmRunnerPath, run);
    }
    const code = fs.readFileSync(path.resolve(relativePath), 'utf8');
    const result = ts.transpileModule(code, {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
    });
    const script = new vm.Script(result.outputText);
    const customRequire = (moduleName: string) => {
        try {
            if (moduleName === "@axiom-crypto/halo2-lib-js") {
                return require("@axiom-crypto/halo2-lib-js");
            }
            else {
                const npmRoot = execSync('npm root').toString().trim();
                return require(`${npmRoot}/${moduleName}`);
            }
        } catch (e) {
            throw new Error(`Cannot find module '${moduleName}'.\n Try installing it globally with 'npm install -g ${moduleName}'`);
        }
    };
    const context = vm.createContext({
        exports: {},
        require: customRequire,
        module: module,
        console: console,
        __filename: __filename,
        __dirname: __dirname,
    });
    script.runInContext(context);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(halo2WasmRunnerPath, code)
    return context.exports.run;
}

export function getUint8ArrayFromBuffer(relativePath: string) {
    const buffer = fs.readFileSync(path.resolve(relativePath));
    return new Uint8Array(buffer);
}

export function saveBufferToFile(buffer: Buffer, relativePath: string, name: string) {
    const filePath = path.resolve(relativePath);
    const folderPath = path.dirname(filePath);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved ${name} to ${filePath}`);
}

export function saveJsonToFile(json: string, relativePath: string, name: string) {
    const filePath = path.resolve(relativePath);
    const folderPath = path.dirname(filePath);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(filePath, json);
    console.log(`Saved ${name} to ${filePath}`);
}

export function readJsonFromFile(relativePath: string) {
    return JSON.parse(fs.readFileSync(path.resolve(relativePath), 'utf8'))
}