import { Halo2LibWasm } from "@axiom-crypto/halo2-wasm/web";

export class CircuitValue {
    private _value: bigint;
    private _cell: number;
    private _circuit: Halo2LibWasm;

    constructor(circuit: Halo2LibWasm, { value, cell }: { value?: bigint | number | string, cell?: number}) {
        this._circuit = circuit;
        if (value !== undefined) {
            this._value = BigInt(value);
            this._cell = this._circuit.constant(value.toString());
        }
        else if(cell !== undefined) {
            this._cell = cell;
            const val = BigInt(circuit.value(cell));
            this._value = val;
        }
        else {
            throw new Error("Invalid input");
        }
    }

    cell(){
        return this._cell;
    }

    value(){
        return this._value;
    }

    number(){
        return Number(this._value);
    }

    address(){
        return "0x" + this._value.toString(16).padStart(40, '0');
    }

}