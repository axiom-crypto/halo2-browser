import { Halo2LibWasm } from "@axiom-crypto/halo2-wasm/web";
import { CircuitValue256 } from "./CircuitValue256";

export class CircuitValue {
  private _value: bigint;
  private _cell: number;
  private _circuit: Halo2LibWasm;

  constructor(
    { value, cell }: { value?: bigint | number | string; cell?: number }
  ) {
    //@ts-ignore
    this._circuit = globalThis.circuit.halo2lib;
    if (value !== undefined) {
      this._value = BigInt(value);
      this._cell = this._circuit.constant(value.toString());
    } else if (cell !== undefined) {
      this._cell = cell;
      const val = BigInt(this._circuit.value(cell));
      this._value = val;
    } else {
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
    return "0x" + this._value.toString(16).padStart(40, "0");
  }

  toCircuitValue256() {
    const b = 2n ** 128n;
    const lookupBits = this._circuit.lookup_bits();
    let paddedNumBits = Math.floor(253 / lookupBits) * lookupBits - 1;
    const [hi, lo] = this._circuit.div_mod(
      this._cell,
      b.toString(),
      paddedNumBits.toString()
    );
    const hi128CircuitValue = new CircuitValue({ cell: hi });
    const lo128CircuitValue = new CircuitValue({ cell: lo });
    const halo2LibValue256 = new CircuitValue256({
      hi: hi128CircuitValue,
      lo: lo128CircuitValue,
    });
    return halo2LibValue256;
  }
}
