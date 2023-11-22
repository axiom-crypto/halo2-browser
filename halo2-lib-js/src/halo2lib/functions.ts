import { convertInput, joinArrays } from "../shared/utils";
import { CircuitValue } from "./CircuitValue";
import { RawCircuitInput } from "../shared/types";
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

/**
     * Creates a circuit variable from a number, bigint, or string.
     *
     * @param a - The raw circuit input.
     * @returns The witness cell.
     */
const witness = (a: RawCircuitInput) => Cell(globalThis.circuit.halo2lib.witness(convertInput(a)));

/**
 * Creates a circuit constant from a number, bigint, or string.
 *
 * @param a - The raw circuit input.
 * @returns The constant cell.
 */
const constant = (a: RawCircuitInput) => Cell(globalThis.circuit.halo2lib.constant(convertInput(a)));

/**
 * Adds two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The sum of the two circuit values.
 */
const add = (a: CircuitValue, b: CircuitValue) => Cell(globalThis.circuit.halo2lib.add(a.cell(), b.cell()));

/**
 * Subtracts the second circuit value from the first circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The difference between the two circuit values.
 */
const sub = (a: CircuitValue, b: CircuitValue) => Cell(globalThis.circuit.halo2lib.sub(a.cell(), b.cell()));

/**
 * Negates a circuit value.
 *
 * @param a - The circuit value to negate.
 * @returns The negation of the circuit value.
 */
const neg = (a: CircuitValue) => Cell(globalThis.circuit.halo2lib.neg(a.cell()));

/**
 * Multiplies two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The product of the two circuit values.
 */
const mul = (a: CircuitValue, b: CircuitValue) => Cell(globalThis.circuit.halo2lib.mul(a.cell(), b.cell()));

/**
 * Multiplies two circuit values and adds a third circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The third circuit value.
 * @returns The result of multiplying the first two circuit values and adding the third circuit value.
 */
const mulAdd = (a: CircuitValue, b: CircuitValue, c: CircuitValue) => Cell(globalThis.circuit.halo2lib.mul_add(a.cell(), b.cell(), c.cell()));

/**
 * Multiplies a circuit value by the negation of another circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The result of multiplying the first circuit value by the negation of the second circuit value.
 */
const mulNot = (a: CircuitValue, b: CircuitValue) => Cell(globalThis.circuit.halo2lib.mul_not(a.cell(), b.cell()));

/**
 * Asserts that a circuit value is a bit.
 *
 * @param a - The circuit value to assert.
 */
const assertBit = (a: CircuitValue) => globalThis.circuit.halo2lib.assert_bit(a.cell());

/**
 * Asserts that a circuit value is a constant.
 *
 * @param a - The circuit value to assert.
 * @param b - The raw circuit input.
 */
const assertIsConst = (a: CircuitValue, b: RawCircuitInput) => globalThis.circuit.halo2lib.assert_is_const(a.cell(), convertInput(b));

/**
 * Computes the inner product of two arrays of circuit values.
 *
 * @param a - The first array of circuit values.
 * @param b - The second array of circuit values.
 * @returns The inner product of the two arrays.
 */
const innerProduct = (a: CircuitValue[], b: CircuitValue[]) => Cell(globalThis.circuit.halo2lib.inner_product(new Uint32Array(a.map(a => a.cell())), new Uint32Array(b.map(b => b.cell()))));

/**
 * Computes the sum of an array of circuit values.
 *
 * @param arr - The array of circuit values.
 * @returns The sum of the array of circuit values.
 */
const sum = (arr: CircuitValue[]) => Cell(globalThis.circuit.halo2lib.sum(new Uint32Array(arr.map(a => a.cell()))));

/**
 * Performs a bitwise AND operation on two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The result of the bitwise AND operation.
 */
const and = (a: CircuitValue, b: CircuitValue) => Cell(globalThis.circuit.halo2lib.and(a.cell(), b.cell()));

/**
 * Performs a bitwise OR operation on two circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The result of the bitwise OR operation.
 */
const or = (a: CircuitValue, b: CircuitValue) => Cell(globalThis.circuit.halo2lib.or(a.cell(), b.cell()));

/**
 * Performs a bitwise NOT operation on a circuit value.
 *
 * @param a - The circuit value.
 * @returns The result of the bitwise NOT operation.
 */
const not = (a: CircuitValue) => Cell(globalThis.circuit.halo2lib.not(a.cell()));

/**
 * Decrements a circuit value by 1.
 *
 * @param a - The circuit value.
 * @returns The decremented circuit value.
 */
const dec = (a: CircuitValue) => Cell(globalThis.circuit.halo2lib.dec(a.cell()));

/**
 * Selects a circuit value based on a condition.
 *
 * @param a - The condition circuit value.
 * @param b - The first circuit value.
 * @param c - The second circuit value.
 * @returns The selected circuit value.
 */
const select = (a: CircuitValue, b: CircuitValue, c: CircuitValue) => Cell(globalThis.circuit.halo2lib.select(a.cell(), b.cell(), c.cell()));

/**
 * Performs a bitwise OR-AND operation on three circuit values.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The third circuit value.
 * @returns The result of the OR-AND operation.
 */
const orAnd = (a: CircuitValue, b: CircuitValue, c: CircuitValue) => Cell(globalThis.circuit.halo2lib.or_and(a.cell(), b.cell(), c.cell()));

/**
 * Converts an array of circuit values to an indicator array.
 *
 * @param bits - The array of circuit values.
 * @returns The indicator circuit value.
 */
const bitsToIndicator = (bits: CircuitValue[]) => {
    const indicator = globalThis.circuit.halo2lib.bits_to_indicator(new Uint32Array(bits.map(b => b.cell())));
    return [...indicator].map((a: number) => Cell(a));
}

/**
 * Converts an index circuit value to an indicator circuit value.
 *
 * @param idx - The index circuit value.
 * @param len - The length of the indicator circuit value.
 * @returns The indicator circuit value.
 */
const idxToIndicator = (idx: CircuitValue, len: RawCircuitInput) => {
    const indicator = globalThis.circuit.halo2lib.idx_to_indicator(idx.cell(), convertInput(len));
    return [...indicator].map((a: number) => Cell(a));
}

/**
 * Selects circuit values from an array based on an indicator circuit value.
 *
 * @param arr - The array of circuit values.
 * @param indicator - The indicator circuit value.
 * @returns The selected circuit values.
 */
const selectByIndicator = (arr: CircuitValue[], indicator: CircuitValue[]) => Cell(globalThis.circuit.halo2lib.select_by_indicator(new Uint32Array(arr.map(a => a.cell())), new Uint32Array(indicator.map(a => a.cell()))));

/**
 * Selects a circuit value from an array based on an index circuit value.
 *
 * @param arr - The array of circuit values.
 * @param idx - The index circuit value.
 * @returns The selected circuit value.
 */
const selectFromIdx = (arr: CircuitValue[], idx: CircuitValue) => Cell(globalThis.circuit.halo2lib.select_from_idx(new Uint32Array(arr.map(a => a.cell())), idx.cell()));


/**
 * Checks if a circuit value is zero.
 *
 * @param a - The circuit value to check.
 * @returns The indicator circuit value representing whether the input is zero.
 */
const isZero = (a: CircuitValue) => Cell(globalThis.circuit.halo2lib.is_zero(a.cell()));

/**
 * Checks if two circuit values are equal.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @returns The indicator circuit value representing whether the two inputs are equal.
 */
const isEqual = (a: CircuitValue, b: CircuitValue) => Cell(globalThis.circuit.halo2lib.is_equal(a.cell(), b.cell()));

/**
 * Converts a circuit value to an array of bits.
 *
 * @param a - The circuit value to convert.
 * @param len - The length of the resulting bit array.
 * @returns The array of bits representing the input circuit value.
 */
const numToBits = (a: CircuitValue, len: RawCircuitInput) => {
    const bits = globalThis.circuit.halo2lib.num_to_bits(a.cell(), convertInput(len));
    const circuitValues = [...bits].map((a: number) => Cell(a));
    return circuitValues;
}

/**
 * Asserts that two circuit values are equal.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 */
const checkEqual = (a: CircuitValue, b: CircuitValue) => globalThis.circuit.halo2lib.constrain_equal(a.cell(), b.cell());

/**
 * Checks if a circuit value is within a specified range.
 *
 * @param a - The circuit value to check.
 * @param b - The range of the circuit value.
 */
const rangeCheck = (a: CircuitValue, b: RawCircuitInput) => globalThis.circuit.halo2lib.range_check(a.cell(), convertInput(b));

/**
 * Checks if the first circuit value is less than the second circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The range of the circuit values.
 */
const checkLessThan = (a: CircuitValue, b: CircuitValue, c?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    rangeCheck(a, convertInput(c));
    rangeCheck(b, convertInput(c));
    globalThis.circuit.halo2lib.check_less_than(a.cell(), b.cell(), getValidatedNumBits(c));
}

/**
 * Checks if the first circuit value is less than the second circuit value.
 *
 * @param a - The first circuit value.
 * @param b - The second circuit value.
 * @param c - The range of the circuit values.
 * @returns The indicator circuit value representing whether the first input is less than the second input.
 */
const isLessThan = (a: CircuitValue, b: CircuitValue, c?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    rangeCheck(a, convertInput(c));
    rangeCheck(b, convertInput(c));
    return Cell(globalThis.circuit.halo2lib.is_less_than(a.cell(), b.cell(), getValidatedNumBits(c)));
}

/**
 * Divides two circuit values and returns the quotient.
 *
 * @param a - The dividend circuit value.
 * @param b - The divisor circuit value.
 * @returns The quotient.
 *
 */
const div = (a: CircuitValue, b: CircuitValue, c?: string, d?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    if (d === undefined) d = getMaxPaddedNumBits();
    const res = globalThis.circuit.halo2lib.div_mod_var(a.cell(), b.cell(), c, d)
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
const mod = (a: CircuitValue, b: CircuitValue, c?: string, d?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    if (d === undefined) d = getMaxPaddedNumBits();
    const [_, remainder] = globalThis.circuit.halo2lib.div_mod_var(a.cell(), b.cell(), c, d)
    return Cell(remainder);
}

/**
 * Raises a circuit value to the power of another circuit value.
 *
 * @param a - The base circuit value.
 * @param b - The exponent circuit value.
 * @returns The result of the exponentiation.
 */
const pow = (a: CircuitValue, b: CircuitValue, c?: string) => {
    if (c === undefined) c = getMaxPaddedNumBits();
    const result = globalThis.circuit.halo2lib.pow_var(a.cell(), b.cell(), c);
    return Cell(result);
}

/**
 * Computes the Poseidon hash of multiple circuit values.
 *
 * @param args - The circuit values to hash.
 * @returns The hash value.
 */
const poseidon = (...args: CircuitValue[]) => Cell(globalThis.circuit.halo2lib.poseidon(new Uint32Array(joinArrays(...args.map(a => a.cell())))));

/**
 * Retrieves the value of a circuit value.
 *
 * @param a - The circuit value.
 * @returns The value of the circuit value.
 */
const value = (a: CircuitValue) => globalThis.circuit.halo2lib.value(a.cell());

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
const makePublic = (a: CircuitValue) => globalThis.circuit.halo2lib.make_public(globalThis.circuit.halo2wasm, a.cell(), 0);

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