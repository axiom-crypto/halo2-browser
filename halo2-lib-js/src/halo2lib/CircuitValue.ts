import { Halo2LibWasm } from "@axiom-crypto/halo2-wasm/web";
import { CircuitValue256 } from "./CircuitValue256";

export class CircuitValue {
    private _value: bigint;
    private _cell: number;
    private _circuit: Halo2LibWasm;

    constructor(circuit: Halo2LibWasm, { value, cell }: { value?: bigint | number | string, cell?: number }) {
        this._circuit = circuit;
        if (value !== undefined) {
            this._value = BigInt(value);
            this._cell = this._circuit.constant(value.toString());
        }
        else if (cell !== undefined) {
            this._cell = cell;
            const val = BigInt(circuit.value(cell));
            this._value = val;
        }
        else {
            throw new Error("Invalid input");
        }
    }

    cell() {
        return this._cell;
    }

    value() {
        return this._value;
    }

    number() {
        return Number(this._value);
    }

    address() {
        return "0x" + this._value.toString(16).padStart(40, '0');
    }

    toCircuitValue256() {
        const b = BigInt(2) ** BigInt(128);
        const bCell = this._circuit.constant(b.toString());
        const lookupBits = this._circuit.lookup_bits();
        let paddedNumBits = Math.floor(253 / lookupBits) * lookupBits - 1;
        const [hi, lo] = this._circuit.div_mod_var(this._cell, bCell, paddedNumBits.toString(), "129")
        const hi128CircuitValue = new CircuitValue(this._circuit, { cell: hi });
        const lo128CircuitValue = new CircuitValue(this._circuit, { cell: lo });
        const halo2LibValue256 = new CircuitValue256(this._circuit, { hi: hi128CircuitValue, lo: lo128CircuitValue });
        return halo2LibValue256;
    }
}