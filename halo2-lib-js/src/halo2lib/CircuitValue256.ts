import { Halo2LibWasm } from "@axiom-crypto/halo2-wasm/web";
import { CircuitValue } from "./CircuitValue";
import { convertRawInput } from "../shared/utils";

export class CircuitValue256 {
  private _value: bigint;
  private _circuitValue: [CircuitValue, CircuitValue];
  private _halo2Lib: Halo2LibWasm;

  constructor(
    {
      value,
      hi,
      lo,
    }: {
      value?: bigint | string | number;
      hi?: CircuitValue;
      lo?: CircuitValue;
    }
  ) {
    //@ts-ignore
    this._halo2Lib = globalThis.circuit.halo2lib;
    if (value !== undefined) {
      if (BigInt(value) < 0n) {
        throw new Error("Value cannot be negative.");
      }
      this._value = BigInt(value);
      let input = BigInt(value)
        .toString(16)
        .padStart(64, "0");
      let hi128 = input.slice(0, 32);
      let lo128 = input.slice(32);

      const hi128CircuitValue = new CircuitValue({
        cell: this._halo2Lib.constant(convertRawInput("0x" + hi128)),
      });
      const lo128CircuitValue = new CircuitValue({
        cell: this._halo2Lib.constant(convertRawInput("0x" + lo128)),
      });
      this._circuitValue = [hi128CircuitValue, lo128CircuitValue];
    } else if (
      hi !== undefined &&
      hi instanceof CircuitValue &&
      lo !== undefined &&
      lo instanceof CircuitValue
    ) {
      this._circuitValue = [hi, lo];
      const hiVal = BigInt(this._halo2Lib.value(hi.cell()));
      const loVal = BigInt(this._halo2Lib.value(lo.cell()));
      const value = hiVal * 2n ** 128n + loVal;
      this._value = value;
    } else {
      throw new Error("Invalid input");
    }
  }

  hi() {
    return this._circuitValue[0];
  }

  lo() {
    return this._circuitValue[1];
  }

  hex() {
    return "0x" + this._value.toString(16).padStart(64, "0");
  }

  value() {
    return this._value;
  }

  toCircuitValue() {
    const b = BigInt(2) ** BigInt(128);
    const bCell = this._halo2Lib.constant(b.toString());
    const cell = this._halo2Lib.mul_add(
      this.hi().cell(),
      bCell,
      this.lo().cell()
    );
    this._halo2Lib.range_check(this.hi().cell(), "125");
    if (
      this.hi()
        .value()
        .toString(2).length > 125
    ) {
      throw new Error(
        "Cannot convert to CircuitValue (value is > 253 bits). Please use .hi()/.lo() instead."
      );
    }
    return new CircuitValue({ cell });
  }
}
