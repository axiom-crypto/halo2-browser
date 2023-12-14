import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-wasm/web";
import { getInputFunctionSignature } from "../shared/utils";
// import { Halo2Lib } from "../halo2lib"
import { CircuitConfig } from "./types";

const parseInputs = (inputs: string) => {
    let parsedInputs = JSON.parse(inputs);
    return parsedInputs;
}

const BLINDING_FACTOR = 20;

export const autoConfigCircuit = (config: CircuitConfig) => {
    let circuit = globalThis.circuit.halo2wasm;
    const stats = circuit.getCircuitStats();

    for (let i = 6; i < 20; i++) {
        if (stats.advice <= (2 ** i - BLINDING_FACTOR) * config.numAdvice && stats.lookup <= 2 ** i - BLINDING_FACTOR && stats.instance <= (2 ** i - BLINDING_FACTOR) * config.numInstance) {
            config.k = i + 1;
            config.numLookupBits = i;
            break;
        }
    }

    circuit.config(config);
}

export const setCircuit = (halo2wasm: Halo2Wasm, halo2lib: Halo2LibWasm, silent?: boolean) => {
    globalThis.circuit = { halo2wasm, halo2lib, silent: silent ?? false };
}


export function Halo2CircuitRunner(halo2wasm: Halo2Wasm, halo2lib: Halo2LibWasm, config: CircuitConfig, silent?: boolean) {

    config = { ...config };
    globalThis.circuit = { halo2wasm, halo2lib, silent: silent ?? false };
    let circuit = globalThis.circuit.halo2wasm;
    let halo2LibWasm = globalThis.circuit.halo2lib;

    const clear = () => {
        circuit.clear();
        halo2LibWasm.config();
    }

    async function runFromString(code: string, inputs: string) {
        clear();
        const halo2Lib = await import("../halo2lib/functions");
        const halo2LibFns = Object.keys(halo2Lib).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));
        const functionInputs = getInputFunctionSignature(inputs);
        const parsedInputs = parseInputs(inputs);
        const fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; (async function({${functionInputs}}) { ${code} })`);
        await fn(parsedInputs);
        circuit.assignInstances();

        autoConfigCircuit(config);
        clear();
        {
            const fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; (async function({${functionInputs}}) { ${code} })`);
            await fn(parsedInputs);
            circuit.assignInstances();
        }
        return {
            config
        }
    }

    async function run<T extends { [key: string]: number | string | bigint }>(f: (inputs: T) => Promise<void>, inputs: T) {
        clear();
        let stringifiedInputs = JSON.stringify(inputs);
        let parsedInputs = parseInputs(stringifiedInputs);
        await f(parsedInputs);
        circuit.assignInstances();
    }

    return Object.freeze({
        runFromString,
        run
    })
}
