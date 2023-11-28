import { writeCircuitToFile } from "./utils";
import * as halo2Lib from "../src/halo2lib/functions";


const buildGateTest = (inputs: number[], func: string) => {
    return `
import * as halo2Lib from "@axiom-crypto/halo2-lib-js";
export const circuit = async (inputs: null) => {
    const {witness, ${func}} = halo2Lib;
    ${func}(${inputs.map((input) => `witness(${input})`).join(", ")});
}`;
}

const buildGateTestFn = (name: string, fn: (inputs: null) => void) => {
    return `import * as halo2Lib from "@axiom-crypto/halo2-lib-js";
    //@ts-ignore\nexport const circuit = async ${fn.toString()}`;
}

const gateTest = (inputs: number[], func: string) => {
    const circuit = buildGateTest(inputs, func);
    writeCircuitToFile(circuit, `${func}.gate.ts`);
}

const gateTestFn = (name: string, fn: (inputs: null) => void) => {
    const circuit = buildGateTestFn(name, fn);
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
    const { witness, assertIsConst } = halo2Lib;
    assertIsConst(witness(15), 15);
})

gateTestFn("innerProduct", (_) => {
    const { witness, innerProduct } = halo2Lib;
    const inputs = [15, 10, 5].map(witness);
    innerProduct(inputs, inputs)
})

gateTestFn("powVar", (_) => {
    const { witness, pow } = halo2Lib;
    pow(witness(15), witness(10), "4")
})

gateTestFn("sum", (_) => {
    const { witness, sum } = halo2Lib;
    sum([witness(15), witness(10), witness(5)])
})

gateTestFn("bitsToIndicator", (_) => {
    const { witness, bitsToIndicator } = halo2Lib;
    bitsToIndicator([1, 0, 0, 1, 0].map(witness))
})

gateTestFn("idxToIndicator", ( _) => {
    const { witness, idxToIndicator } = halo2Lib;
    idxToIndicator(witness(8), 12)
})

gateTestFn("selectByIndicator", (_) => {
    const { witness, selectByIndicator } = halo2Lib;
    const input = ["1", "2", "3", "4"].map(witness);
    const indicator = ["0", "0", "1", "0"].map(witness);
    selectByIndicator(input, indicator)
})

gateTestFn("selectFromIdx", (_) => {
    const { witness, selectFromIdx } = halo2Lib;
    const input = ["1", "2", "3", "4"].map(witness);
    selectFromIdx(input, witness(2))
})

gateTestFn("numToBits", ( _) => {
    const { witness, numToBits } = halo2Lib;
    numToBits(witness(15), 5)
})

gateTestFn("constrainEqual", ( _) => {
    const { witness, checkEqual } = halo2Lib;
    checkEqual(witness(15), witness(15))
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
    const { witness, poseidon } = halo2Lib;
    poseidon(...["90", "50", "12", "12"].map(witness))
})

gateTestFn("makePublic", (_) => {
    const { witness, makePublic } = halo2Lib;
    makePublic(witness(10))
})