import { Halo2Lib } from "../src/halo2lib";
import { writeCircuitToFile } from "./utils";

const buildGateTestFn = (fn: (halo2Lib: Halo2Lib, inputs: null) => void) => {
    return `//@ts-ignore\nexport const circuit = async ${fn.toString()}`;
}

const rangeTest = (name: string, fn: (halo2Lib: Halo2Lib, inputs: null) => void) => {
    const circuit = buildGateTestFn(fn);
    writeCircuitToFile(circuit, `${name}.range.ts`);
}

rangeTest("rangeCheck", (halo2Lib, _) => {
    const { witness, rangeCheck } = halo2Lib;
    rangeCheck(witness(15141), 128)
})

rangeTest("checkLessThan", (halo2Lib, _) => {
    const { witness, checkLessThan } = halo2Lib;
    checkLessThan(witness(10), witness(15), "8")
})

rangeTest("isLessThan", (halo2Lib, _) => {
    const { witness, isLessThan } = halo2Lib;
    isLessThan(witness(10), witness(15), "8")
})

rangeTest("divModVar", (halo2Lib, _) => {
    const { witness, div } = halo2Lib;
    div(witness(90), witness(50), "12", "12")
});

rangeTest("divModVar.1", (halo2Lib, _) => {
    const { witness, mod } = halo2Lib;
    mod(witness(90), witness(50), "12", "12")
});

