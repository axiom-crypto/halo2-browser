// Generated by dts-bundle-generator v8.0.1

import {
	Bn254FqPoint,
	Bn254G1AffinePoint,
	Bn254G2AffinePoint,
	Secp256k1AffinePoint,
} from "@axiom-crypto/halo2-wasm/web";
import { CircuitValue } from "../../halo2lib/CircuitValue";
import { CircuitValue256 } from "../../halo2lib/CircuitValue256";
import { CircuitBn254Fq2, CircuitBn254G1Affine, CircuitBn254G2Affine, CircuitSecp256k1Affine } from "../../halo2lib/ecc";

export type RawCircuitInput = string | number | bigint;
export type ConstantValue = RawCircuitInput;

/**
 * Creates a circuit variable from a number, bigint, or string.
 *
 * @param a The raw circuit input.
 * @returns The witness cell.
 */
declare const witness: (a: ConstantValue) => CircuitValue;
/**
 * Creates a circuit constant from a number, bigint, or string.
 *
 * @param a The raw circuit input.
 * @returns The constant cell.
 */
declare const constant: (a: ConstantValue) => CircuitValue;
/**
 * Adds two circuit values.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @returns The sum of the two circuit values.
 */
declare const add: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Subtracts the second circuit value from the first circuit value.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @returns The difference between the two circuit values.
 */
declare const sub: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Negates a circuit value.
 *
 * @param a The circuit value to negate.
 * @returns The negation of the circuit value.
 */
declare const neg: (a: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Multiplies two circuit values.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @returns The product of the two circuit values.
 */
declare const mul: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Multiplies two circuit values and adds a third circuit value.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @param c The third circuit value.
 * @returns The result of multiplying the first two circuit values and adding the third circuit value.
 */
declare const mulAdd: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	c: ConstantValue | CircuitValue
) => CircuitValue;
/**
 * Multiplies a circuit value by the negation of another circuit value.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @returns The result of multiplying the first circuit value by the negation of the second circuit value.
 */
declare const mulNot: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Asserts that a circuit value is a bit.
 *
 * @param a The circuit value to assert.
 */
declare const assertBit: (a: ConstantValue | CircuitValue) => void;
/**
 * Asserts that a circuit value is a constant.
 *
 * @param a The circuit value to assert.
 * @param b The raw circuit input.
 */
declare const assertIsConst: (a: ConstantValue | CircuitValue, b: ConstantValue) => void;
/**
 * Computes the inner product of two arrays of circuit values.
 *
 * @param a The first array of circuit values.
 * @param b The second array of circuit values.
 * @returns The inner product of the two arrays.
 */
declare const innerProduct: (
	a: (ConstantValue | CircuitValue)[],
	b: (ConstantValue | CircuitValue)[]
) => CircuitValue;
/**
 * Computes the sum of an array of circuit values.
 *
 * @param arr The array of circuit values.
 * @returns The sum of the array of circuit values.
 */
declare const sum: (arr: (ConstantValue | CircuitValue)[]) => CircuitValue;
/**
 * Performs a bitwise AND operation on two circuit values.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @returns The result of the bitwise AND operation.
 */
declare const and: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Performs a bitwise OR operation on two circuit values.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @returns The result of the bitwise OR operation.
 */
declare const or: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Performs a bitwise NOT operation on a circuit value.
 *
 * @param a The circuit value.
 * @returns The result of the bitwise NOT operation.
 */
declare const not: (a: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Decrements a circuit value by 1.
 *
 * @param a The circuit value.
 * @returns The decremented circuit value.
 */
declare const dec: (a: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Selects a circuit value based on a condition.
 *
 * @param a The first circuit value.
 * @param b The first circuit value.
 * @param sel The condition boolean circuit value.
 * @returns sel ? a : b
 */
declare const select: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	sel: ConstantValue | CircuitValue
) => CircuitValue;
/**
 * Performs a bitwise OR-AND operation on three circuit values.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @param c The third circuit value.
 * @returns The result of the OR-AND operation.
 */
declare const orAnd: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	c: ConstantValue | CircuitValue
) => CircuitValue;
/**
 * Converts an array of circuit values to an indicator array.
 *
 * @param bits The array of circuit values.
 * @returns The indicator circuit value.
 */
declare const bitsToIndicator: (bits: (ConstantValue | CircuitValue)[]) => CircuitValue[];
/**
 * Converts an index circuit value to an indicator circuit value.
 *
 * @param idx The index circuit value.
 * @param len The length of the indicator circuit value.
 * @returns The indicator circuit value.
 */
declare const idxToIndicator: (
	idx: ConstantValue | CircuitValue,
	len: ConstantValue
) => CircuitValue[];
/**
 * Selects circuit values from an array based on an indicator circuit value.
 *
 * @param arr The array of circuit values.
 * @param indicator The indicator circuit value.
 * @returns The selected circuit values.
 */
declare const selectByIndicator: (
	arr: ConstantValue | CircuitValue[],
	indicator: (ConstantValue | CircuitValue)[]
) => CircuitValue;
/**
 * Selects a circuit value from an array based on an index circuit value.
 *
 * @param arr The array of circuit values.
 * @param idx The index circuit value.
 * @returns The selected circuit value.
 */
declare const selectFromIdx: (
	arr: (ConstantValue | CircuitValue)[],
	idx: ConstantValue | CircuitValue
) => CircuitValue;
/**
 * Checks if a circuit value is zero.
 *
 * @param a The circuit value to check.
 * @returns The indicator circuit value representing whether the input is zero.
 */
declare const isZero: (a: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Checks if two circuit values are equal.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @returns The indicator circuit value representing whether the two inputs are equal.
 */
declare const isEqual: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => CircuitValue;
/**
 * Converts a circuit value to an array of bits.
 *
 * @param a The circuit value to convert.
 * @param len The length of the resulting bit array.
 * @returns The array of bits representing the input circuit value.
 */
declare const numToBits: (
	a: ConstantValue | CircuitValue,
	len: ConstantValue
) => CircuitValue[];
/**
 * Asserts that two circuit values are equal.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 */
declare const checkEqual: (a: ConstantValue | CircuitValue, b: ConstantValue | CircuitValue) => void;
/**
 * Checks if a circuit value is within a specified range.
 *
 * @param a The circuit value to check.
 * @param b The range of the circuit value.
 */
declare const rangeCheck: (a: ConstantValue | CircuitValue, b: ConstantValue) => void;
/**
 * Checks if the first circuit value is less than the second circuit value.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @param c The range of the circuit values.
 */
declare const checkLessThan: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	c?: string
) => void;
/**
 * Checks if the first circuit value is less than the second circuit value.
 *
 * @param a The first circuit value.
 * @param b The second circuit value.
 * @param c The range of the circuit values.
 * @returns The indicator circuit value representing whether the first input is less than the second input.
 */
declare const isLessThan: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	c?: string
) => CircuitValue;
/**
 * Divides two circuit values and returns the quotient.
 *
 * @param a The dividend circuit value.
 * @param b The divisor circuit value.
 * @returns The quotient.
 *
 */
declare const div: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	c?: string,
	d?: string
) => CircuitValue;
/**
 * Divides two circuit values and returns the remainder.
 *
 * @param a The dividend circuit value.
 * @param b The divisor circuit value.
 * @returns The remainder.
 *
 */
declare const mod: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	c?: string,
	d?: string
) => CircuitValue;
/**
 * Raises a circuit value to the power of another circuit value.
 *
 * @param a The base circuit value.
 * @param b The exponent circuit value.
 * @returns The result of the exponentiation.
 */
declare const pow: (
	a: ConstantValue | CircuitValue,
	b: ConstantValue | CircuitValue,
	c?: string
) => CircuitValue;
/**
 * Computes the Poseidon hash of multiple circuit values.
 *
 * @param args The circuit values to hash.
 * @returns The hash value.
 */
declare const poseidon: (...args: (ConstantValue | CircuitValue)[]) => CircuitValue;
/**
 * Retrieves the value of a circuit value.
 *
 * @param a The circuit value.
 * @returns The value of the circuit value.
 */
declare const value: (a: CircuitValue) => any;
/**
 * Logs the provided *circuit* values to the console. Use `console.log` for normal logging.
 *
 * @param args The `CircuitValue`s to log.
 */
declare const log: (...args: any) => void;
declare const console: {
	/**
	 * Logs any *non CircuitValue* to the console. Use `log` for logging `CircuitValue`s.
	 * @param args The values to log.
	 */
	log: (...args: any) => void;
};
declare const ecdsaBenchmark: (
	sk: bigint,
	msg_hash: bigint,
	k: bigint
) => CircuitValue;

/**
 * Creates new `CircuitValue256` and range checks `hi, lo` to be `uint128`s.
 * @param hi
 * @param lo
 * @returns
 */
declare const newCircuitValue256: (
	hi: CircuitValue,
	lo: CircuitValue
) => CircuitValue256;
//ecc

/**
 *
 * @param val The field point to load, in hi-lo form. The hi, lo values must have been constrained to be `uint128`s.
 * @returns `Bn254FqPoint` whose internals are opaque to the user.
 */
declare const loadBn254Fq: (val: CircuitValue256) => Bn254FqPoint;

/**
 *
 * @param val
 * @returns `val` in hi-lo form
 */
declare const convertBn254FqToCircuitValue256: (
	val: Bn254FqPoint
) => CircuitValue256;

/**
 * @param point The affine point to load, with coordinates `CircuitValue256`. The hi, lo values must have been constrained to be `uint128`s.
 * @returns `Bn254G1AffinePoint`, which has been constrained to lie on the curve. Currently this point is not allowed to be identity (0, 0).
 */
declare const loadBn254G1: (point: CircuitBn254G1Affine) => Bn254G1AffinePoint;

/**
 * Sums the values of the provided G1 affine points
 *
 * @param points - The array of `CircuitBn254G1Affine` points. All coordinates are in hi, lo form, and we assume they have been range checked to be `uint128`s.
 * @returns The sum of all these points as `Bn254G1AffinePoint`.
 */
declare const bn254G1Sum: (
	points: Array<CircuitBn254G1Affine>
) => Bn254G1AffinePoint;

/**
 * Subtracts the 2 points and returns the value. Constrains that the points are not equal and also one is not the negative of the other (this would be a point doubling, which requires a different formula).
 *
 * @returns The subtraction of these points.
 * @param g1Point1 - G1 point, x,y in hi lo format for each coordinate
 * @param g1Point2 - G1 point, x,y in hi lo format for each coordinate
 */
declare const bn254G1SubUnequal: (
	g1Point1: CircuitBn254G1Affine,
	g1Point2: CircuitBn254G1Affine
) => Bn254G1AffinePoint;

/**
 * @param point The affine point to load, with coordinates `CircuitBn254Fq2`. The hi, lo values must have been constrained to be `uint128`s.
 * @returns `Bn254G2AffinePoint`, which has been constrained to lie on the curve. Currently this point is not allowed to be identity (Fq2(0), Fq2(0)).
 */
declare const loadBn254G2: (point: CircuitBn254G2Affine) => Bn254G2AffinePoint;

/**
 * Sums the values of the provided G2 affine points
 *
 * @param points - The array of `CircuitBn254G2Affine` points. All coordinates are `CircuitBn254Fq2`, whose coordinates are in hi, lo form, and we assume the hi, lo's have been range checked to be `uint128`s.
 * @returns The sum of all these points as `Bn254G2AffinePoint`.
 */
declare const bn254G2Sum: (
	points: Array<CircuitBn254G2Affine>
) => Bn254G2AffinePoint;

/**
 * Verifies that e(lhsG1, lhsG2) = e(rhsG1, rhsG2) by checking e(lhsG1, lhsG2)*e(-rhsG1, rhsG2) === 1
 * None of the points should be identity.
 *
 * @param lhsG1
 * @param lhsG2
 * @param rhsG1
 * @param rhsG2
 * @returns [CircuitValue] for the result as a boolean (1 if signature verification is successful).
 */
declare const bn254PairingCheck: (
	lhsG1: Bn254G1AffinePoint,
	lhsG2: Bn254G2AffinePoint,
	rhsG1: Bn254G1AffinePoint,
	rhsG2: Bn254G2AffinePoint
) => CircuitValue;

/**
 * @param pubkey The public key to load, in the form of an affine elliptic curve point `(x, y)` where `x, y` have type `CircuitValue256`. The hi, lo values of each `CircuitValue256` must have been constrained to be `uint128`s.
 * @returns `Secp256k1AffinePoint`, the public key as a loaded elliptic curve point. This has been constrained to lie on the curve. The public key is constrained to not be the identity (0, 0).
 */
declare const loadSecp256k1Pubkey: (
	pubkey: CircuitSecp256k1Affine
) => Secp256k1AffinePoint;

/**
 *
 * Verifies the ECDSA signature `(r, s)` with message hash `msgHash` using the secp256k1 public key `pubkey`. Returns 1 if the signature is valid, 0 otherwise.
 * @param pubkey
 * @param r
 * @param s
 * @param msgHash
 * @returns
 */
declare const verifySecp256k1ECDSASignature: (
	pubkey: Secp256k1AffinePoint,
	r: CircuitValue256,
	s: CircuitValue256,
	msgHash: CircuitValue256
) => CircuitValue;
