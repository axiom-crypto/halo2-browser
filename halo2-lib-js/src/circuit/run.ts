import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-wasm/web";
import { getInputFunctionSignature } from "../shared/utils";
import { Halo2Lib } from "../halo2lib"
import { CircuitConfig } from "./types";

const parseInputs = (inputs: string) => {
    let parsedInputs = JSON.parse(inputs);
    return parsedInputs;
}

const BLINDING_FACTOR = 20;

export const autoConfigCircuit = (circuit: Halo2Wasm, config: CircuitConfig) => {
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


export function Halo2CircuitRunner(circuit: Halo2Wasm, halo2LibWasm: Halo2LibWasm, config: CircuitConfig) {

    config = { ...config };

    const clear = () => {
        circuit.clear();
        halo2LibWasm.config();
    }

    async function runFromString(code: string, inputs: string) {
        clear();
        const halo2Lib = new Halo2Lib(circuit, halo2LibWasm, { firstPass: true });
        const halo2LibFns = Object.keys(halo2Lib).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));
        const functionInputs = getInputFunctionSignature(inputs);
        const parsedInputs = parseInputs(inputs);
        const fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; (async function({${functionInputs}}) { ${code} })`);
        await fn(parsedInputs);

        autoConfigCircuit(circuit, config);
        clear();
        {
            const halo2Lib = new Halo2Lib(circuit, halo2LibWasm);
            const halo2LibFns = Object.keys(halo2Lib).filter(key => !(typeof key === 'string' && key.charAt(0) === '_'));
            const fn = eval(`let {${halo2LibFns.join(", ")}} = halo2Lib; (async function({${functionInputs}}) { ${code} })`);
            await fn(parsedInputs);
        }
        return {
            config
        }
    }

    async function run<T extends { [key: string]: number | string | bigint }>(f: (halo2Lib: Halo2Lib, inputs: T) => Promise<void>, inputs: T) {
        clear();
        let halo2Lib = new Halo2Lib(circuit, halo2LibWasm);
        let stringifiedInputs = JSON.stringify(inputs);
        let parsedInputs = parseInputs(stringifiedInputs);
        await f(halo2Lib, parsedInputs);
    }

    return Object.freeze({
        runFromString,
        run
    })
}
