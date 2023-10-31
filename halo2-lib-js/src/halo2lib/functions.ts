import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-wasm/web";
import { convertInput, joinArrays } from "../shared/utils";
import { CircuitValue } from "./CircuitValue";
import { RawCircuitInput } from "../shared/types";
import {Bn254FqPoint, Bn254G1AffinePoint, Bn254G2AffinePoint, JsCircuitBn254Fq2, JsCircuitBn254G1Affine, JsCircuitBn254G2Affine, JsCircuitSecp256k1Affine, JsCircuitValue256, Secp256k1AffinePoint} from "@axiom-crypto/halo2-wasm/web/halo2_wasm";
import { CircuitValue256 } from "./CircuitValue256";
import { CircuitBn254Fq2, CircuitBn254G1Affine, CircuitBn254G2Affine, CircuitSecp256k1Affine } from "./ecc";

export class Halo2Lib {

    private _halo2wasm: Halo2Wasm;
    private  _halo2lib: Halo2LibWasm;
    private _firstPass: boolean;
    private _MAX_BITS: string;

    constructor(halo2wasm: Halo2Wasm, circuit: Halo2LibWasm, options?: { firstPass?: boolean }) {
        this. _halo2lib = circuit;
        this._firstPass = options?.firstPass ?? false;
        this._MAX_BITS = this.getMaxPaddedNumBits();
        this._halo2wasm = halo2wasm;
    }

    private Cell(a: number) {
        return new CircuitValue(this. _halo2lib, { cell: a });
    }

    private getMaxPaddedNumBits() {
        const lookupBits = this. _halo2lib.lookup_bits();
        let maxPaddedNumBits = Math.floor(253 / lookupBits) * lookupBits - 1;
        return maxPaddedNumBits.toString()
    }

    private getValidatedNumBits(numBits: string) {
        if(Number(numBits) > Number(this._MAX_BITS)) throw new Error(`Number of bits must be less than ${this._MAX_BITS}`);
        return numBits;
    }

    /**
     * Creates a circuit variable from a number, bigint, or string.
     *
     * @param a - The raw circuit input.
     * @returns The witness cell.
     */
    witness = (a: RawCircuitInput) => this.Cell(this. _halo2lib.witness(convertInput(a)));

    /**
     * Creates a circuit constant from a number, bigint, or string.
     *
     * @param a - The raw circuit input.
     * @returns The constant cell.
     */
    constant = (a: RawCircuitInput) => this.Cell(this. _halo2lib.constant(convertInput(a)));

    /**
     * Adds two circuit values.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @returns The sum of the two circuit values.
     */
    add = (a: CircuitValue, b: CircuitValue) => this.Cell(this. _halo2lib.add(a.cell(), b.cell()));

    /**
     * Subtracts the second circuit value from the first circuit value.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @returns The difference between the two circuit values.
     */
    sub = (a: CircuitValue, b: CircuitValue) => this.Cell(this. _halo2lib.sub(a.cell(), b.cell()));

    /**
     * Negates a circuit value.
     *
     * @param a - The circuit value to negate.
     * @returns The negation of the circuit value.
     */
    neg = (a: CircuitValue) => this.Cell(this. _halo2lib.neg(a.cell()));

    /**
     * Multiplies two circuit values.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @returns The product of the two circuit values.
     */
    mul = (a: CircuitValue, b: CircuitValue) => this.Cell(this. _halo2lib.mul(a.cell(), b.cell()));

    /**
     * Multiplies two circuit values and adds a third circuit value.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @param c - The third circuit value.
     * @returns The result of multiplying the first two circuit values and adding the third circuit value.
     */
    mulAdd = (a: CircuitValue, b: CircuitValue, c: CircuitValue) => this.Cell(this. _halo2lib.mul_add(a.cell(), b.cell(), c.cell()));

    /**
     * Multiplies a circuit value by the negation of another circuit value.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @returns The result of multiplying the first circuit value by the negation of the second circuit value.
     */
    mulNot = (a: CircuitValue, b: CircuitValue) => this.Cell(this. _halo2lib.mul_not(a.cell(), b.cell()));

    /**
     * Asserts that a circuit value is a bit.
     *
     * @param a - The circuit value to assert.
     */
    assertBit = (a: CircuitValue) => this. _halo2lib.assert_bit(a.cell());

    /**
     * Asserts that a circuit value is a constant.
     *
     * @param a - The circuit value to assert.
     * @param b - The raw circuit input.
     */
    assertIsConst = (a: CircuitValue, b: RawCircuitInput) => this. _halo2lib.assert_is_const(a.cell(), convertInput(b));

    /**
     * Computes the inner product of two arrays of circuit values.
     *
     * @param a - The first array of circuit values.
     * @param b - The second array of circuit values.
     * @returns The inner product of the two arrays.
     */
    innerProduct = (a: CircuitValue[], b: CircuitValue[]) => this.Cell(this. _halo2lib.inner_product(new Uint32Array(a.map(a => a.cell())), new Uint32Array(b.map(b => b.cell()))));

    /**
     * Computes the sum of an array of circuit values.
     *
     * @param arr - The array of circuit values.
     * @returns The sum of the array of circuit values.
     */
    sum = (arr: CircuitValue[]) => this.Cell(this. _halo2lib.sum(new Uint32Array(arr.map(a => a.cell()))));

    /**
     * Performs a bitwise AND operation on two circuit values.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @returns The result of the bitwise AND operation.
     */
    and = (a: CircuitValue, b: CircuitValue) => this.Cell(this. _halo2lib.and(a.cell(), b.cell()));

    /**
     * Performs a bitwise OR operation on two circuit values.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @returns The result of the bitwise OR operation.
     */
    or = (a: CircuitValue, b: CircuitValue) => this.Cell(this. _halo2lib.or(a.cell(), b.cell()));

    /**
     * Performs a bitwise NOT operation on a circuit value.
     *
     * @param a - The circuit value.
     * @returns The result of the bitwise NOT operation.
     */
    not = (a: CircuitValue) => this.Cell(this. _halo2lib.not(a.cell()));

    /**
     * Decrements a circuit value by 1.
     *
     * @param a - The circuit value.
     * @returns The decremented circuit value.
     */
    dec = (a: CircuitValue) => this.Cell(this. _halo2lib.dec(a.cell()));

    /**
     * Selects a circuit value based on a condition.
     *
     * @param a - The condition circuit value.
     * @param b - The first circuit value.
     * @param c - The second circuit value.
     * @returns The selected circuit value.
     */
    select = (a: CircuitValue, b: CircuitValue, c: CircuitValue) => this.Cell(this. _halo2lib.select(a.cell(), b.cell(), c.cell()));

    /**
     * Performs a bitwise OR-AND operation on three circuit values.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @param c - The third circuit value.
     * @returns The result of the OR-AND operation.
     */
    orAnd = (a: CircuitValue, b: CircuitValue, c: CircuitValue) => this.Cell(this. _halo2lib.or_and(a.cell(), b.cell(), c.cell()));

    /**
     * Converts an array of circuit values to an indicator array.
     *
     * @param bits - The array of circuit values.
     * @returns The indicator circuit value.
     */
    bitsToIndicator = (bits: CircuitValue[]) => {
        const indicator = this. _halo2lib.bits_to_indicator(new Uint32Array(bits.map(b => b.cell())));
        return [...indicator].map((a: number) => this.Cell(a));
    }

    /**
     * Converts an index circuit value to an indicator circuit value.
     *
     * @param idx - The index circuit value.
     * @param len - The length of the indicator circuit value.
     * @returns The indicator circuit value.
     */
    idxToIndicator = (idx: CircuitValue, len: RawCircuitInput) => {
        const indicator = this. _halo2lib.idx_to_indicator(idx.cell(), convertInput(len));
        return [...indicator].map((a: number) => this.Cell(a));
    }

    /**
     * Selects circuit values from an array based on an indicator circuit value.
     *
     * @param arr - The array of circuit values.
     * @param indicator - The indicator circuit value.
     * @returns The selected circuit values.
     */
    selectByIndicator = (arr: CircuitValue[], indicator: CircuitValue[]) => this.Cell(this. _halo2lib.select_by_indicator(new Uint32Array(arr.map(a => a.cell())), new Uint32Array(indicator.map(a => a.cell()))));

    /**
     * Selects a circuit value from an array based on an index circuit value.
     *
     * @param arr - The array of circuit values.
     * @param idx - The index circuit value.
     * @returns The selected circuit value.
     */
    selectFromIdx = (arr: CircuitValue[], idx: CircuitValue) => this.Cell(this. _halo2lib.select_from_idx(new Uint32Array(arr.map(a => a.cell())), idx.cell()));


    /**
     * Checks if a circuit value is zero.
     *
     * @param a - The circuit value to check.
     * @returns The indicator circuit value representing whether the input is zero.
     */
    isZero = (a: CircuitValue) => this.Cell(this. _halo2lib.is_zero(a.cell()));

    /**
     * Checks if two circuit values are equal.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @returns The indicator circuit value representing whether the two inputs are equal.
     */
    isEqual = (a: CircuitValue, b: CircuitValue) => this.Cell(this. _halo2lib.is_equal(a.cell(), b.cell()));

    /**
     * Converts a circuit value to an array of bits.
     *
     * @param a - The circuit value to convert.
     * @param len - The length of the resulting bit array.
     * @returns The array of bits representing the input circuit value.
     */
    numToBits = (a: CircuitValue, len: RawCircuitInput) => {
        const bits = this. _halo2lib.num_to_bits(a.cell(), convertInput(len));
        const circuitValues = [...bits].map((a: number) => this.Cell(a));
        return circuitValues;
    }

    /**
     * Asserts that two circuit values are equal.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     */
    checkEqual = (a: CircuitValue, b: CircuitValue) => this. _halo2lib.constrain_equal(a.cell(), b.cell());

    /**
     * Checks if a circuit value is within a specified range.
     *
     * @param a - The circuit value to check.
     * @param b - The range of the circuit value.
     */
    rangeCheck = (a: CircuitValue, b: RawCircuitInput) => this. _halo2lib.range_check(a.cell(), convertInput(b));

    /**
     * Checks if the first circuit value is less than the second circuit value.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @param c - The range of the circuit values.
     */
    checkLessThan = (a: CircuitValue, b: CircuitValue, c: string = this._MAX_BITS) => {
        this.rangeCheck(a, convertInput(c));
        this.rangeCheck(b, convertInput(c));
        this. _halo2lib.check_less_than(a.cell(), b.cell(), this.getValidatedNumBits(c));
    }

    /**
     * Checks if the first circuit value is less than the second circuit value.
     *
     * @param a - The first circuit value.
     * @param b - The second circuit value.
     * @param c - The range of the circuit values.
     * @returns The indicator circuit value representing whether the first input is less than the second input.
     */
    isLessThan = (a: CircuitValue, b: CircuitValue, c: string = this._MAX_BITS) => {
        this.rangeCheck(a, convertInput(c));
        this.rangeCheck(b, convertInput(c));
        return this.Cell(this. _halo2lib.is_less_than(a.cell(), b.cell(), this.getValidatedNumBits(c)));
    }

    /**
     * Divides two circuit values and returns the quotient.
     *
     * @param a - The dividend circuit value.
     * @param b - The divisor circuit value.
     * @returns The quotient.
     *
     */
    div = (a: CircuitValue, b: CircuitValue, c: string = this._MAX_BITS, d: string = this._MAX_BITS) => {
        if (this._firstPass) {
            b = this.constant(1);
        }
        const res = this. _halo2lib.div_mod_var(a.cell(), b.cell(), c, d)
        return this.Cell(res[0]);
    }

    /**
     * Divides two circuit values and returns the remainder.
     *
     * @param a - The dividend circuit value.
     * @param b - The divisor circuit value.
     * @returns The remainder.
     *
     */
    mod = (a: CircuitValue, b: CircuitValue, c: string = this._MAX_BITS, d: string = this._MAX_BITS) => {
        const [_, remainder] = this. _halo2lib.div_mod_var(a.cell(), b.cell(), c, d)
        return this.Cell(remainder);
    }

    /**
     * Raises a circuit value to the power of another circuit value.
     *
     * @param a - The base circuit value.
     * @param b - The exponent circuit value.
     * @returns The result of the exponentiation.
     */
    pow = (a: CircuitValue, b: CircuitValue, c: string = this._MAX_BITS) => {
        const result = this. _halo2lib.pow_var(a.cell(), b.cell(), c);
        return this.Cell(result);
    }

    /**
     * Computes the Poseidon hash of multiple circuit values.
     *
     * @param args - The circuit values to hash.
     * @returns The hash value.
     */
    poseidon = (...args: CircuitValue[]) => this.Cell(this. _halo2lib.poseidon(new Uint32Array(joinArrays(...args.map(a => a.cell())))));

    /**
     * Retrieves the value of a circuit value.
     *
     * @param a - The circuit value.
     * @returns The value of the circuit value.
     */
    value = (a: CircuitValue) => this. _halo2lib.value(a.cell());

    /**
     * Logs the provided *circuit* values to the console. Use `console.log` for normal logging.
     *
     * @param args - The values to log (can be `CircuitValue`s or `CircuitValue256`s).
     */
    log = (...args: any) => {
        if (this._firstPass) return;
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
    makePublic = (a: CircuitValue) => this. _halo2lib.make_public(this._halo2wasm, a.cell(), 0);

    ecdsaBenchmark = (sk: bigint, msg_hash: bigint, k: bigint) => {
        const res = this. _halo2lib.ecdsa_benchmark(sk, msg_hash, k);
        return this.Cell(res);
    }

    // ========== BN254 Elliptic Curve functions ============

    /**
     * 
     * @param val The field point to load, in hi-lo form. The hi, lo values must have been constrained to be `uint128`s.
     * @returns `Bn254FqPoint` whose internals are opaque to the user.
     */
    loadBn254Fq = (val: CircuitValue256): Bn254FqPoint =>{
        return this._halo2lib.load_bn254_fq(toJsCircuitValue256(val));
    }
    convertBn254FqToCircuitValue256 = (val: Bn254FqPoint) => {
        const _val = val.to_circuit_value_256(this._halo2lib);
        return new CircuitValue256(this._halo2lib, { hi: this.Cell(_val.hi), lo: this.Cell(_val.lo) });
    }

    /**
     * @param point The affine point to load, with coordinates `CircuitValue256`. The hi, lo values must have been constrained to be `uint128`s.
     * @returns `Bn254G1AffinePoint`, which has been constrained to lie on the curve. Currently this point is not allowed to be identity (0, 0).
     */
    loadBn254G1 = (point: CircuitBn254G1Affine): Bn254G1AffinePoint => {
        return this._halo2lib.load_bn254_g1(toJsCircuitBn254G1Affine(point));
    }

    /**
     * Sums the values of the provided G1 affine points
     *
     * @param points - The array of `CircuitBn254G1Affine` points. All coordinates are in hi, lo form, and we assume they have been range checked to be `uint128`s.
     * @returns The sum of all these points as `Bn254G1AffinePoint`.
     */
    bn254G1Sum = (points: Array<CircuitBn254G1Affine>): Bn254G1AffinePoint => {
        const _points = points.map(toJsCircuitBn254G1Affine);
        return this._halo2lib.bn254_g1_sum(_points);
    };

    /**
     * Subtracts the 2 points and returns the value. Constrains that the points are not equal and also one is not the negative of the other (this would be a point doubling, which requires a different formula).
     *
     * @returns The subtraction of these points.
     * @param g1Point1 - G1 point, x,y in hi lo format for each coordinate
     * @param g1Point2 - G1 point, x,y in hi lo format for each coordinate
     */

    bn254G1SubUnequal = (g1Point1: CircuitBn254G1Affine, g1Point2: CircuitBn254G1Affine): Bn254G1AffinePoint => {
        return this._halo2lib.bn254_g1_sub_unequal(toJsCircuitBn254G1Affine(g1Point1), toJsCircuitBn254G1Affine(g1Point2));
    };

    /**
     * @param point The affine point to load, with coordinates `CircuitBn254Fq2`. The hi, lo values must have been constrained to be `uint128`s.
     * @returns `Bn254G2AffinePoint`, which has been constrained to lie on the curve. Currently this point is not allowed to be identity (Fq2(0), Fq2(0)).
     */
    loadBn254G2 = (point: CircuitBn254G2Affine): Bn254G2AffinePoint => {    
        return this._halo2lib.load_bn254_g2(toJsCircuitBn254G2Affine(point));
    }

    /**
     * Sums the values of the provided G2 affine points
     *
     * @param points - The array of `CircuitBn254G2Affine` points. All coordinates are `CircuitBn254Fq2`, whose coordinates are in hi, lo form, and we assume the hi, lo's have been range checked to be `uint128`s.
     * @returns The sum of all these points as `Bn254G2AffinePoint`.
     */
    bn254G2Sum = (points: Array<CircuitBn254G2Affine>): Bn254G2AffinePoint => {
        const _points = points.map(toJsCircuitBn254G2Affine);
        return this._halo2lib.bn254_g2_sum(_points);
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
    bn254PairingCheck = (lhsG1: Bn254G1AffinePoint, lhsG2: Bn254G2AffinePoint, rhsG1: Bn254G1AffinePoint, rhsG2: Bn254G2AffinePoint): CircuitValue => {
        return this.Cell(this._halo2lib.bn254_pairing_check(lhsG1, lhsG2, rhsG1, rhsG2));
    }

    /**
     * @param pubkey The public key to load, in the form of an affine elliptic curve point `(x, y)` where `x, y` have type `CircuitValue256`. The hi, lo values of each `CircuitValue256` must have been constrained to be `uint128`s.
     * @returns `Secp256k1AffinePoint`, the public key as a loaded elliptic curve point. This has been constrained to lie on the curve. The public key is constrained to not be the identity (0, 0).
     */
    loadSecp256k1Pubkey = (pubkey: CircuitSecp256k1Affine): Secp256k1AffinePoint => {
        return this._halo2lib.load_secp256k1_pubkey(toJsCircuitSecp256k1Affine(pubkey));
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
    verifySecp256k1ECDSASignature = (pubkey: Secp256k1AffinePoint, r: CircuitValue256, s: CircuitValue256, msgHash: CircuitValue256): CircuitValue => {
        return this.Cell(this._halo2lib.verify_secp256k1_ecdsa_signature(pubkey, toJsCircuitValue256(r), toJsCircuitValue256(s), toJsCircuitValue256(msgHash)));
    }
}

function toJsCircuitValue256(val: CircuitValue256): JsCircuitValue256 {
    return new JsCircuitValue256(val.hi().cell(), val.lo().cell());
}

function toJsCircuitBn254G1Affine(point: CircuitBn254G1Affine): JsCircuitBn254G1Affine {
    return new JsCircuitBn254G1Affine(toJsCircuitValue256(point.x), toJsCircuitValue256(point.y));
}

function toJsCircuitBn254Fq2(point: CircuitBn254Fq2): JsCircuitBn254Fq2 {
    return new JsCircuitBn254Fq2(toJsCircuitValue256(point.c0), toJsCircuitValue256(point.c1));
}

function toJsCircuitBn254G2Affine(point: CircuitBn254G2Affine): JsCircuitBn254G2Affine {
    const x = toJsCircuitBn254Fq2(point.x);
    const y = toJsCircuitBn254Fq2(point.y);
    return new JsCircuitBn254G2Affine(x,y);
}

function toJsCircuitSecp256k1Affine(point: CircuitSecp256k1Affine): JsCircuitSecp256k1Affine{
    return new JsCircuitSecp256k1Affine(toJsCircuitValue256(point.x), toJsCircuitValue256(point.y));
}
