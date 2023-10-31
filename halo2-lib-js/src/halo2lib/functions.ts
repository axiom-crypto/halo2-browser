import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-wasm/web";
import { convertInput, joinArrays } from "../shared/utils";
import { CircuitValue } from "./CircuitValue";
import { RawCircuitInput } from "../shared/types";
import {Bn254G1AffinePoint, JsCircuitBn254G1Affine, JsCircuitValue256} from "@axiom-crypto/halo2-wasm/web/halo2_wasm";

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
     * Subtracts the 2 points and returns the value.
     *
     * @returns The subtraction of these points.
     * @param g1Point1 - G1 point, x,y in hi lo format for each coordinate
     * @param g1Point2 - G1 point, x,y in hi lo format for each coordinate
     */

    bn254G1Sub = (g1Point1: Array<Array<bigint>>, g1Point2: Array<Array<bigint>>) => {
        let jsG1point1: JsCircuitBn254G1Affine = new JsCircuitBn254G1Affine();
        let g1point1x: JsCircuitValue256 = new JsCircuitValue256();
        let g1point1y: JsCircuitValue256 = new JsCircuitValue256();
        g1point1x.hi = this._halo2lib.constant(g1Point1[0][0].toString()); // x, hi value
        g1point1x.lo = this._halo2lib.constant(g1Point1[0][1].toString()); // x, lo value
        g1point1y.hi = this._halo2lib.constant(g1Point1[1][0].toString()); // y, hi value
        g1point1y.lo = this._halo2lib.constant(g1Point1[1][1].toString()); // y, lo value
        jsG1point1.x = g1point1x;
        jsG1point1.y = g1point1y;

        let jsG1point2: JsCircuitBn254G1Affine = new JsCircuitBn254G1Affine();
        let g1point2x: JsCircuitValue256 = new JsCircuitValue256();
        let g1point2y: JsCircuitValue256 = new JsCircuitValue256();
        g1point2x.hi = this._halo2lib.constant(g1Point2[0][0].toString()); // x, hi value
        g1point2x.lo = this._halo2lib.constant(g1Point2[0][1].toString()); // x, lo value
        g1point2y.hi = this._halo2lib.constant(g1Point2[1][0].toString()); // y, hi value
        g1point2y.lo = this._halo2lib.constant(g1Point2[1][1].toString()); // y, lo value
        jsG1point2.x = g1point1x;
        jsG1point2.y = g1point1y;
        const bn254G1AffinePoint: Bn254G1AffinePoint = this._halo2lib.bn254_g1_sub(jsG1point1, jsG1point2);

        // would something like this work ?
        const jsBn254G1AffinePoint: JsCircuitBn254G1Affine = bn254G1AffinePoint.to_circuit_values_256(this._halo2lib)
        this.Cell(this._halo2lib.constant(jsBn254G1AffinePoint.x.toString()));
        this.Cell(this._halo2lib.constant(jsBn254G1AffinePoint.y.toString()));

    };

    /**
     * Sums the values of the provided G1 points
     *
     * @param points - The array of circuit values in high,low form of each coordinate of G1 points.
     * [G1point1, G1point2, G1point3 ... ] and each Gpoint i.e [x,y] and each x and y will be [hi, lo]
     * @returns The sum of all these points.
     */

    bn254G1Sum = (points: Array<Array<Array<bigint>>>) => {
        // Convert to JsCircuitBn254G1Affine
        let jsCircuitBn254G1AffineArray: JsCircuitBn254G1Affine[] = [];
        for(let i=0; i<points.length; i++){
            let newJsCircuitValue256X = new JsCircuitValue256();
            let newJsCircuitValue256Y = new JsCircuitValue256();
            newJsCircuitValue256X.hi = this._halo2lib.constant(points[i][0][0].toString());
            newJsCircuitValue256X.lo = this._halo2lib.constant(points[i][0][1].toString());

            newJsCircuitValue256Y.hi = this._halo2lib.constant(points[i][1][0].toString());
            newJsCircuitValue256Y.lo = this._halo2lib.constant(points[i][1][1].toString());
            let newJsCircuitBn254G1Affine = new JsCircuitBn254G1Affine();
            newJsCircuitBn254G1Affine.x = newJsCircuitValue256X;
            newJsCircuitBn254G1Affine.y = newJsCircuitValue256Y;
            jsCircuitBn254G1AffineArray.push(newJsCircuitBn254G1Affine);
        }

        const bn254G1AffinePoint: Bn254G1AffinePoint = this._halo2lib.bn254_g1_sum(jsCircuitBn254G1AffineArray);

        // would something liek this work ?
        const jsBn254G1AffinePoint: JsCircuitBn254G1Affine = bn254G1AffinePoint.to_circuit_values_256(this._halo2lib)
        this.Cell(this._halo2lib.constant(jsBn254G1AffinePoint.x.toString()));
        this.Cell(this._halo2lib.constant(jsBn254G1AffinePoint.y.toString()));
    };


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

}