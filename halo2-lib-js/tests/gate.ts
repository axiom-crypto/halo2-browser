import { writeCircuitToFile } from "./utils";
import * as halo2Lib from "../src/halo2lib/functions";


const buildGateTest = (inputs: number[], func: string) => {
    return `
import * as halo2Lib from "@axiom-crypto/halo2-lib-js";
export const circuit = async (inputs: null) => {
    const {constant, ${func}} = halo2Lib;
    ${func}(${inputs.map((input) => `constant(${input})`).join(", ")});
}`;
}

const buildGateTestFn = (fn: (inputs: null) => void) => {
    return `import * as halo2Lib from "@axiom-crypto/halo2-lib-js";
    export const circuit = async ${fn.toString()}`;
}

const gateTest = (inputs: number[], func: string) => {
    const circuit = buildGateTest(inputs, func);
    writeCircuitToFile(circuit, `${func}.gate.ts`);
}

const gateTestFn = (name: string, fn: (inputs: null) => void) => {
    const circuit = buildGateTestFn(fn);
    writeCircuitToFile(circuit, `${name}.gate.ts`);
}

gateTest([15, 10], "add");
gateTest([15, 10], "sub");
gateTest([15], "neg");
gateTest([15, 10], "mul");
gateTest([15, 10, 10], "mulAdd");
gateTest([15, 10], "mulNot");
gateTest([1], "assertBit");
gateTest([1, 1], "and");
gateTest([1, 0], "or");
gateTest([1], "not");
gateTest([100], "dec");
gateTest([1, 0, 1], "orAnd");
gateTest([0], "isZero");
gateTest([9, 5], "isEqual");
gateTest([10, 5, 0], "select");

gateTestFn("assertIsConst", (_) => {
    const { constant, assertIsConst } = halo2Lib;
    assertIsConst(constant(15), 15);
})

gateTestFn("innerProduct", (_) => {
    const { constant, innerProduct } = halo2Lib;
    const inputs = [15, 10, 5].map(constant);
    innerProduct(inputs, inputs)
})

gateTestFn("powVar", (_) => {
    const { constant, pow } = halo2Lib;
    pow(constant(15), constant(10), "4")
})

gateTestFn("sum", (_) => {
    const { constant, sum } = halo2Lib;
    sum([constant(15), constant(10), constant(5)])
})

gateTestFn("bitsToIndicator", (_) => {
    const { constant, bitsToIndicator } = halo2Lib;
    bitsToIndicator([1, 0, 0, 1, 0].map(constant))
})

gateTestFn("idxToIndicator", ( _) => {
    const { constant, idxToIndicator } = halo2Lib;
    idxToIndicator(constant(8), 12)
})

gateTestFn("selectByIndicator", (_) => {
    const { constant, selectByIndicator } = halo2Lib;
    const input = ["1", "2", "3", "4"].map(constant);
    const indicator = ["0", "0", "1", "0"].map(constant);
    selectByIndicator(input, indicator)
})

gateTestFn("selectFromIdx", (_) => {
    const { constant, selectFromIdx } = halo2Lib;
    const input = ["1", "2", "3", "4"].map(constant);
    selectFromIdx(input, constant(2))
})

gateTestFn("numToBits", ( _) => {
    const { constant, numToBits } = halo2Lib;
    numToBits(constant(15), 5)
})

gateTestFn("constrainEqual", ( _) => {
    const { constant, checkEqual } = halo2Lib;
    checkEqual(constant(15), constant(15))
})

gateTestFn("constant", (_) => {
    const { constant } = halo2Lib;
    constant(15)
})

gateTestFn("witness", (_) => {
    const { witness } = halo2Lib;
    witness(15)
})

gateTestFn("poseidon", ( _) => {
    const { constant, poseidon } = halo2Lib;
    poseidon(...["90", "50", "12", "12"].map(constant))
})

gateTestFn("makePublic", (_) => {
    const { constant, makePublic } = halo2Lib;
    makePublic(constant(10))
})