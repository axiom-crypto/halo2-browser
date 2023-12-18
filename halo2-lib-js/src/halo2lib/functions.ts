import { convertRawInput, joinArrays } from "../shared/utils";
import { CircuitValue } from "./CircuitValue";
import { ConstantValue, RawCircuitInput } from "../shared/types";
import { CircuitValue256 } from "./CircuitValue256";
//to get rid of `Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature.` error
import * as x from "../global";

export const Cell = (a: number) => new CircuitValue({ cell: a });

const getMaxPaddedNumBits = () => {
    const lookupBits = globalThis.circuit.halo2lib.lookup_bits();
    let maxPaddedNumBits = Math.floor(253 / lookupBits) * lookupBits - 1;
    return maxPaddedNumBits.toString()
}

const getValidatedNumBits = (numBits: string) => {
    const maxBits = getMaxPaddedNumBits();
    if (Number(numBits) > Number(maxBits)) throw new Error(`Number of bits must be less than ${maxBits}`);
    return numBits;
}

const convertCircuitInput = (a: ConstantValue | CircuitValue) => {
    if (a instanceof CircuitValue) {
        return a.cell();
    } else {
        return constant(a).cell();
    }
}

/**
     * Creates a circuit variable from a number, bigint, or string.
     *
     * @param a - The raw circuit input.
     * @returns The witness cell.
     */
const witness = (a: RawCircuitInput) => Cell(globalThis.circuit.halo2lib.witness(convertRawInput(a)));

/**
 * Creates a circuit constant from a number, bigint, or string.
 *
 * @param a - The raw circuit input.
 * @returns The constant cell.
 */
const constant = (a: RawCircuitInput) => Cell(globalThis.circuit.halo2lib.constant(convertRawInput(a)));

/**
 * Adds two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The sum of the two circuit values.
 */
const add = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => {
    return Cell(globalThis.circuit.halo2lib.add(convertCircuitInput(a), convertCircuitInput(b)));
}

/**
 * Subtracts the second circuit value from the first circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The difference between the two circuit values.
 */
const sub = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => {
    return Cell(globalThis.circuit.halo2lib.sub(convertCircuitInput(a), convertCircuitInput(b)));
}

/**
 * Negates a circuit value.
 *
 * @param a - The circuit value to negate.
 * @returns The negation of the circuit value.
 */
const neg = (a: ConstantValue | CircuitValue) => {
    Cell(globalThis.circuit.halo2lib.neg(convertCircuitInput(a)));
}

/**
 * Multiplies two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The product of the two circuit values.
 */
const mul = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => {
    return Cell(globalThis.circuit.halo2lib.mul(convertCircuitInput(a), convertCircuitInput(b)));
}

/**
 * Multiplies two circuit values and adds a third circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The third circuit value.
 * @returns The result of multiplying the first two circuit values and adding the third circuit value.
 */
const mulAdd = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c: ConstantValue | CircuitValue) => {
    return Cell(globalThis.circuit.halo2lib.mul_add(convertCircuitInput(a), convertCircuitInput(b), convertCircuitInput(c)));
}

/**
 * Multiplies a circuit value by the negation of another circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The result of multiplying the first circuit value by the negation of the second circuit value.
 */
const mulNot = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => {
    return Cell(globalThis.circuit.halo2lib.mul_not(convertCircuitInput(a), convertCircuitInput(b)));
}

/**
 * Asserts that a circuit value is a bit.
 *
 * @param a - The circuit value to assert.
 */
const assertBit = (a: ConstantValue | CircuitValue) => globalThis.circuit.halo2lib.assert_bit(convertCircuitInput(a));

/**
 * Asserts that a circuit value is a constant.
 *
 * @param a - The circuit value to assert.
 * @param b - The raw circuit input.
 */
const assertIsConst = (a: ConstantValue | CircuitValue, b: ConstantValue) => globalThis.circuit.halo2lib.assert_is_const(convertCircuitInput(a), convertRawInput(b));

/**
 * Computes the inner product of two arrays of circuit values.
 *
 * @param a - The first array of circuit values.
 * @param b - The second array of circuit values.
 * @returns The inner product of the two arrays.
 */
const innerProduct = (a: (CircuitValue | ConstantValue)[], b: (CircuitValue | ConstantValue)[]) => Cell(globalThis.circuit.halo2lib.inner_product(new Uint32Array(a.map(a => convertCircuitInput(a))), new Uint32Array(b.map(b => convertCircuitInput(b)))));

/**
 * Computes the sum of an array of circuit values.
 *
 * @param arr - The array of circuit values.
 * @returns The sum of the array of circuit values.
 */
const sum = (arr: (CircuitValue | ConstantValue)[]) => Cell(globalThis.circuit.halo2lib.sum(new Uint32Array(arr.map(a => convertCircuitInput(a)))));

/**
 * Performs a bitwise AND operation on two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The result of the bitwise AND operation.
 */
const and = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.and(convertCircuitInput(a), convertCircuitInput(b)));

/**
 * Performs a bitwise OR operation on two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The result of the bitwise OR operation.
 */
const or = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.or(convertCircuitInput(a), convertCircuitInput(b)));

/**
 * Performs a bitwise NOT operation on a circuit value.
 *
 * @param a - The circuit value.
 * @returns The result of the bitwise NOT operation.
 */
const not = (a: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.not(convertCircuitInput(a)));

/**
 * Decrements a circuit value by 1.
 *
 * @param a - The circuit value.
 * @returns The decremented circuit value.
 */
const dec = (a: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.dec(convertCircuitInput(a)));

/**
 * Selects a circuit value based on a condition.
 *
 * @param a - The condition circuit value.
 * @param b - The first circuit value.
 * @param c - The second circuit value.
 * @returns The selected circuit value.
 */
const select = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.select(convertCircuitInput(a), convertCircuitInput(b), convertCircuitInput(c)));

/**
 * Performs a bitwise OR-AND operation on three circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The third circuit value.
 * @returns The result of the OR-AND operation.
 */
const orAnd = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.or_and(convertCircuitInput(a), convertCircuitInput(b), convertCircuitInput(c)));

/**
 * Converts an array of circuit values to an indicator array.
 *
 * @param bits - The array of circuit values.
 * @returns The indicator circuit value.
 */
const bitsToIndicator = (bits: (CircuitValue | ConstantValue)[]) => {
    const indicator = globalThis.circuit.halo2lib.bits_to_indicator(new Uint32Array(bits.map(b => convertCircuitInput(b))));
    return [...indicator].map((a: number) => Cell(a));
}

/**
 * Converts an index circuit value to an indicator circuit value.
 *
 * @param idx - The index circuit value.
 * @param len - The length of the indicator circuit value.
 * @returns The indicator circuit value.
 */
const idxToIndicator = (idx: CircuitValue | ConstantValue, len: ConstantValue) => {
    const indicator = globalThis.circuit.halo2lib.idx_to_indicator(convertCircuitInput(idx), convertRawInput(len));
    return [...indicator].map((a: number) => Cell(a));
}

/**
 * Selects circuit values from an array based on an indicator circuit value.
 *
 * @param arr - The array of circuit values.
 * @param indicator - The indicator circuit value.
 * @returns The selected circuit values.
 */
const selectByIndicator = (arr: (ConstantValue | CircuitValue)[], indicator: (ConstantValue | CircuitValue)[]) => Cell(globalThis.circuit.halo2lib.select_by_indicator(new Uint32Array(arr.map(a => convertCircuitInput(a))), new Uint32Array(indicator.map(a => convertCircuitInput(a)))));

/**
 * Selects a circuit value from an array based on an index circuit value.
 *
 * @param arr - The array of circuit values.
 * @param idx - The index circuit value.
 * @returns The selected circuit value.
 */
const selectFromIdx = (arr: (ConstantValue | CircuitValue)[], idx: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.select_from_idx(new Uint32Array(arr.map(a => convertCircuitInput(a))), convertCircuitInput(idx)));


/**
 * Checks if a circuit value is zero.
 *
 * @param a - The circuit value to check.
 * @returns The indicator circuit value representing whether the input is zero.
 */
const isZero = (a: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.is_zero(convertCircuitInput(a)));

/**
 * Checks if two circuit values are equal.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The indicator circuit value representing whether the two inputs are equal.
 */
const isEqual = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => Cell(globalThis.circuit.halo2lib.is_equal(convertCircuitInput(a), convertCircuitInput(b)));

/**
 * Converts a circuit value to an array of bits.
 *
 * @param a - The circuit value to convert.
 * @param len - The length of the resulting bit array.
 * @returns The array of bits representing the input circuit value.
 */
const numToBits = (a: ConstantValue | CircuitValue, len: ConstantValue) => {
    const bits = globalThis.circuit.halo2lib.num_to_bits(convertCircuitInput(a), convertRawInput(len));
    const circuitValues = [...bits].map((a: number) => Cell(a));
    return circuitValues;
}

/**
 * Asserts that two circuit values are equal.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 */
const checkEqual = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => globalThis.circuit.halo2lib.constrain_equal(convertCircuitInput(a), convertCircuitInput(b));

/**
 * Checks if a circuit value is within a specified range.
 *
 * @param a - The circuit value to check.
 * @param b - The range of the circuit value.
 */
const rangeCheck = (a: ConstantValue | CircuitValue, b: ConstantValue) => globalThis.circuit.halo2lib.range_check(convertCircuitInput(a), convertRawInput(b));

/**
 * Checks if the first circuit value is less than the second circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The range of the circuit values.
 */
const checkLessThan = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    rangeCheck(a, convertRawInput(c));
    rangeCheck(b, convertRawInput(c));
    globalThis.circuit.halo2lib.check_less_than(convertCircuitInput(a), convertCircuitInput(b), getValidatedNumBits(c));
}

/**
 * Checks if the first circuit value is less than the second circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The range of the circuit values.
 * @returns The indicator circuit value representing whether the first input is less than the second input.
 */
const isLessThan = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    rangeCheck(a, convertRawInput(c));
    rangeCheck(b, convertRawInput(c));
    return Cell(globalThis.circuit.halo2lib.is_less_than(convertCircuitInput(a), convertCircuitInput(b), getValidatedNumBits(c)));
}

/**
 * Divides two circuit values and returns the quotient.
 *
 * @param a - The dividend circuit value.
 * @param b - The divisor circuit value.
 * @returns The quotient.
 *
 */
const div = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string, d?: string) => {
    //TODO: if ConstantValue, set c/d to right number of bits
    if (c === undefined) c = getMaxPaddedNumBits();
    if (d === undefined) d = getMaxPaddedNumBits();
    const res = globalThis.circuit.halo2lib.div_mod_var(convertCircuitInput(a), convertCircuitInput(b), c, d)
    return Cell(res[0]);
}

/**
 * Divides two circuit values and returns the remainder.
 *
 * @param a - The dividend circuit value.
 * @param b - The divisor circuit value.
 * @returns The remainder.
 *
 */
const mod = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string, d?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    if (d === undefined) d = getMaxPaddedNumBits();
    const [_, remainder] = globalThis.circuit.halo2lib.div_mod_var(convertCircuitInput(a), convertCircuitInput(b), c, d)
    return Cell(remainder);
}

/**
 * Raises a circuit value to the power of another circuit value.
 *
 * @param a - The base circuit value.
 * @param b - The exponent circuit value.
 * @returns The result of the exponentiation.
 */
const pow = (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue, c?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    const result = globalThis.circuit.halo2lib.pow_var(convertCircuitInput(a), convertCircuitInput(b), c);
    return Cell(result);
}

/**
 * Computes the Poseidon hash of multiple circuit values.
 *
 * @param args - The circuit values to hash.
 * @returns The hash value.
 */
const poseidon = (...args: (CircuitValue | ConstantValue)[]) => Cell(globalThis.circuit.halo2lib.poseidon(new Uint32Array(joinArrays(...args.map(a => convertCircuitInput(a))))));

/**
 * Retrieves the value of a circuit value.
 *
 * @param a - The circuit value.
 * @returns The value of the circuit value.
 */
const value = (a: CircuitValue) => globalThis.circuit.halo2lib.value(convertCircuitInput(a));

/**
 * Logs the provided *circuit* values to the console. Use `console.log` for normal logging.
 *
 * @param args - The values to log (can be `CircuitValue`s or `CircuitValue256`s).
 */
const log = (...args: any) => {
    if (globalThis.circuit.silent) return;
    let arr = joinArrays(...args).map(a => "0x" + a.value().toString(16));
    if (arr.length === 1) {
        console.log(arr[0]);
    } else {
        console.log(arr);
    }
};

/**
 * Makes a circuit value public.
 *
 * @param a - The circuit value to make public.
 */
const makePublic = (a: CircuitValue | ConstantValue) => globalThis.circuit.halo2lib.make_public(globalThis.circuit.halo2wasm, convertCircuitInput(a), 0);

/**
 * Creates new `CircuitValue256` and range checks `hi, lo` to be `uint128`s.
 * @param hi 
 * @param lo 
 * @returns 
 */
const newCircuitValue256 = (hi: CircuitValue, lo: CircuitValue): CircuitValue256 => {
    rangeCheck(hi, 128);
    rangeCheck(lo, 128);
    return new CircuitValue256({ hi, lo });
}

export {
    witness,
    constant,
    add,
    sub,
    neg,
    mul,
    mulAdd,
    mulNot,
    assertBit,
    assertIsConst,
    innerProduct,
    sum,
    and,
    or,
    not,
    dec,
    select,
    orAnd,
    bitsToIndicator,
    idxToIndicator,
    selectByIndicator,
    selectFromIdx,
    isZero,
    isEqual,
    numToBits,
    checkEqual,
    rangeCheck,
    checkLessThan,
    isLessThan,
    div,
    mod,
    pow,
    poseidon,
    value,
    log,
    makePublic
}