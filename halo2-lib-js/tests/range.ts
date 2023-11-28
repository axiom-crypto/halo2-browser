import { writeCircuitToFile } from "./utils";
import * as halo2Lib from "../src/halo2lib/functions";

const buildGateTestFn = (fn: (inputs: null) => void) => {
    return `import * as halo2Lib from "@axiom-crypto/halo2-lib-js";
    export const circuit = async ${fn.toString()}`;
}

const rangeTest = (name: string, fn: (inputs: null) => void) => {
    const circuit = buildGateTestFn(fn);
    writeCircuitToFile(circuit, `${name}.range.ts`);
}

rangeTest("rangeCheck", ( _) => {
    const { witness, rangeCheck } = halo2Lib;
    rangeCheck(witness(15141), 128)
})

rangeTest("checkLessThan", ( _) => {
    const { witness, checkLessThan } = halo2Lib;
    checkLessThan(witness(10), witness(15), "8")
})

rangeTest("isLessThan", (_) => {
    const { witness, isLessThan } = halo2Lib;
    isLessThan(witness(10), witness(15), "8")
})

rangeTest("divModVar", ( _) => {
    const { witness, div } = halo2Lib;
    div(witness(90), witness(50), "12", "12")
});

rangeTest("divModVar.1", (_) => {
    const { witness, mod } = halo2Lib;
    mod(witness(90), witness(50), "12", "12")
});

