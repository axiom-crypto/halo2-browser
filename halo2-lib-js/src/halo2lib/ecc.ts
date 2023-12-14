import { Bn254FqPoint, Bn254G1AffinePoint, Bn254G2AffinePoint, Secp256k1AffinePoint } from "@axiom-crypto/halo2-wasm/web";
import { CircuitValue } from "./CircuitValue";
import { CircuitValue256 } from "./CircuitValue256";
import { Cell } from "./functions";

export interface CircuitBn254Fq2 {
  c0: CircuitValue256;
  c1: CircuitValue256;
}

export interface CircuitBn254G1Affine {
  x: CircuitValue256;
  y: CircuitValue256;
}

export interface CircuitBn254G2Affine {
  x: CircuitBn254Fq2;
  y: CircuitBn254Fq2;
}

export interface CircuitSecp256k1Affine {
  x: CircuitValue256;
  y: CircuitValue256;
}

const toJsCircuitValue256 = (val: CircuitValue256) => {
  return globalThis.circuit.halo2lib.to_js_circuit_value_256(val.hi().cell(), val.lo().cell());
}

const toJsCircuitBn254G1Affine = (point: CircuitBn254G1Affine) => {
  return globalThis.circuit.halo2lib.to_js_circuit_bn254_g1_affine(toJsCircuitValue256(point.x), toJsCircuitValue256(point.y));
}

const toJsCircuitBn254Fq2 = (point: CircuitBn254Fq2) => {
  return globalThis.circuit.halo2lib.to_js_circuit_bn254_fq2(toJsCircuitValue256(point.c0), toJsCircuitValue256(point.c1));
}

const toJsCircuitBn254G2Affine = (point: CircuitBn254G2Affine) => {
  return globalThis.circuit.halo2lib.to_js_circuit_bn254_g2_affine(toJsCircuitBn254Fq2(point.x), toJsCircuitBn254Fq2(point.y));
}

const toJsCircuitSecp256k1Affine = (point: CircuitSecp256k1Affine) => {
  return globalThis.circuit.halo2lib.to_js_circuit_secp256k1_affine(toJsCircuitValue256(point.x), toJsCircuitValue256(point.y));
}

/**
 * 
 * @param val The field point to load, in hi-lo form. The hi, lo values must have been constrained to be `uint128`s.
 * @returns `Bn254FqPoint` whose internals are opaque to the user.
 */
const loadBn254Fq = (val: CircuitValue256): Bn254FqPoint => {
  return globalThis.circuit.halo2lib.load_bn254_fq(toJsCircuitValue256(val));
}

/**
 * 
 * @param val 
 * @returns `val` in hi-lo form
 */
const convertBn254FqToCircuitValue256 = (val: Bn254FqPoint) => {
  const _val = val.to_circuit_value_256(globalThis.circuit.halo2lib);
  return new CircuitValue256({ hi: Cell(_val.hi), lo: Cell(_val.lo) });
}

/**
 * @param point The affine point to load, with coordinates `CircuitValue256`. The hi, lo values must have been constrained to be `uint128`s.
 * @returns `Bn254G1AffinePoint`, which has been constrained to lie on the curve. Currently this point is not allowed to be identity (0, 0).
 */
const loadBn254G1 = (point: CircuitBn254G1Affine): Bn254G1AffinePoint => {
  return globalThis.circuit.halo2lib.load_bn254_g1(toJsCircuitBn254G1Affine(point));
}

/**
 * Sums the values of the provided G1 affine points
 *
 * @param points - The array of `CircuitBn254G1Affine` points. All coordinates are in hi, lo form, and we assume they have been range checked to be `uint128`s.
 * @returns The sum of all these points as `Bn254G1AffinePoint`.
 */
const bn254G1Sum = (points: Array<CircuitBn254G1Affine>): Bn254G1AffinePoint => {
  const _points = [];
  for (let i = 0; i < points.length; i++) {
    _points.push(toJsCircuitBn254G1Affine(points[i]));
  }
  return globalThis.circuit.halo2lib.bn254_g1_sum(_points);
};

/**
 * Subtracts the 2 points and returns the value. Constrains that the points are not equal and also one is not the negative of the other (this would be a point doubling, which requires a different formula).
 *
 * @returns The subtraction of these points.
 * @param g1Point1 - G1 point, x,y in hi lo format for each coordinate
 * @param g1Point2 - G1 point, x,y in hi lo format for each coordinate
 */

const bn254G1SubUnequal = (g1Point1: CircuitBn254G1Affine, g1Point2: CircuitBn254G1Affine): Bn254G1AffinePoint => {
  return globalThis.circuit.halo2lib.bn254_g1_sub_unequal(toJsCircuitBn254G1Affine(g1Point1), toJsCircuitBn254G1Affine(g1Point2));
};

/**
 * @param point The affine point to load, with coordinates `CircuitBn254Fq2`. The hi, lo values must have been constrained to be `uint128`s.
 * @returns `Bn254G2AffinePoint`, which has been constrained to lie on the curve. Currently this point is not allowed to be identity (Fq2(0), Fq2(0)).
 */
const loadBn254G2 = (point: CircuitBn254G2Affine): Bn254G2AffinePoint => {
  return globalThis.circuit.halo2lib.load_bn254_g2(toJsCircuitBn254G2Affine(point));
}

/**
 * Sums the values of the provided G2 affine points
 *
 * @param points - The array of `CircuitBn254G2Affine` points. All coordinates are `CircuitBn254Fq2`, whose coordinates are in hi, lo form, and we assume the hi, lo's have been range checked to be `uint128`s.
 * @returns The sum of all these points as `Bn254G2AffinePoint`.
 */
const bn254G2Sum = (points: Array<CircuitBn254G2Affine>): Bn254G2AffinePoint => {
  const _points = [];
  for (let i = 0; i < points.length; i++) {
    _points.push(toJsCircuitBn254G2Affine(points[i]));
  }
  return globalThis.circuit.halo2lib.bn254_g2_sum(_points);
}

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
const bn254PairingCheck = (lhsG1: Bn254G1AffinePoint, lhsG2: Bn254G2AffinePoint, rhsG1: Bn254G1AffinePoint, rhsG2: Bn254G2AffinePoint): CircuitValue => {
  return Cell(globalThis.circuit.halo2lib.bn254_pairing_check(lhsG1, lhsG2, rhsG1, rhsG2));
}

/**
 * @param pubkey The public key to load, in the form of an affine elliptic curve point `(x, y)` where `x, y` have type `CircuitValue256`. The hi, lo values of each `CircuitValue256` must have been constrained to be `uint128`s.
 * @returns `Secp256k1AffinePoint`, the public key as a loaded elliptic curve point. This has been constrained to lie on the curve. The public key is constrained to not be the identity (0, 0).
 */
const loadSecp256k1Pubkey = (pubkey: CircuitSecp256k1Affine): Secp256k1AffinePoint => {
  return globalThis.circuit.halo2lib.load_secp256k1_pubkey(toJsCircuitSecp256k1Affine(pubkey));
}

/**
 * 
 * Verifies the ECDSA signature `(r, s)` with message hash `msgHash` using the secp256k1 public key `pubkey`. Returns 1 if the signature is valid, 0 otherwise.
 * @param pubkey 
 * @param r 
 * @param s 
 * @param msgHash 
 * @returns 
 */
const verifySecp256k1ECDSASignature = (pubkey: Secp256k1AffinePoint, r: CircuitValue256, s: CircuitValue256, msgHash: CircuitValue256): CircuitValue => {
  return Cell(globalThis.circuit.halo2lib.verify_secp256k1_ecdsa_signature(pubkey, toJsCircuitValue256(r), toJsCircuitValue256(s), toJsCircuitValue256(msgHash)));
}

export {
  loadBn254Fq,
  convertBn254FqToCircuitValue256,
  loadBn254G1,
  bn254G1Sum,
  bn254G1SubUnequal,
  loadBn254G2,
  bn254G2Sum,
  bn254PairingCheck,
  loadSecp256k1Pubkey,
  verifySecp256k1ECDSASignature
}
