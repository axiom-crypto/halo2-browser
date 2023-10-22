# halo2-js

This repository aims to streamline the process of writing circuits in Typescript using [halo2-lib-wasm](https://github.com/axiom-crypto/halo2-wasm/blob/0665753bedf1e678da1e16c31befd3bf304479ae/src/halo2lib.rs#L32). To discuss or collaborate, join our community on [Telegram](https://t.me/halo2browser).

## Getting Started

To build your own `halo2-wasm` module, see this [README](https://github.com/axiom-crypto/halo2-wasm). 

Install `halo2-js` in your own JS/TS project with
```
pnpm install @axiom-crypto/halo2-js
```
or use your favorite package manager (npm, yarn, etc.).

## Setting up the `CircuitScaffold`

The `halo2-wasm` package already has an abstract `CircuitScaffold` that must implemented. Here is an example using `Halo2LibWasm` and `Halo2CircuitRunner`:

### Web

```typescript
import { Halo2LibWasm, CircuitConfig, CircuitScaffold } from "@axiom-crypto/halo2-wasm/web";
import { Halo2CircuitRunner, Halo2Lib } from "@axiom-crypto/halo2-js";

export class WebCircuitScaffold extends CircuitScaffold {

    halo2Lib!: Halo2LibWasm;

    constructor(options) {
        super(options);
    }

    newCircuitFromConfig(config: CircuitConfig): void {
        super.newCircuitFromConfig(config);
        if (this.halo2Lib) this.halo2Lib.free();
        this.halo2Lib = getHalo2LibWasm(this.halo2wasm);
    }

    async populateCircuit(circuit: (halo2Lib: Halo2Lib, inputs: any) => Promise<void>, inputs: any) {
        this.newCircuitFromConfig(this.config);
        this.timeStart("Witness generation");
        await Halo2CircuitRunner(this.halo2wasm, this.halo2Lib, this.config).run(circuit, inputs);
        this.timeEnd("Witness generation");
    }

}
```

### Node.js

```typescript
import { Halo2LibWasm, CircuitConfig, CircuitScaffold } from "@axiom-crypto/halo2-wasm/js";
import { Halo2CircuitRunner, Halo2Lib } from "@axiom-crypto/halo2-js";

export class JsCircuitScaffold extends CircuitScaffold {

    halo2Lib!: Halo2LibWasm;

    constructor(options) {
        super(options);
    }

    newCircuitFromConfig(config: CircuitConfig): void {
        super.newCircuitFromConfig(config);
        if (this.halo2Lib) this.halo2Lib.free();
        this.halo2Lib = getHalo2LibWasm(this.halo2wasm);
    }

    async populateCircuit(circuit: (halo2Lib: Halo2Lib, inputs: any) => Promise<void>, inputs: any) {
        this.newCircuitFromConfig(this.config);
        this.timeStart("Witness generation");
        await Halo2CircuitRunner(this.halo2wasm, this.halo2Lib, this.config).run(circuit, inputs);
        this.timeEnd("Witness generation");
    }

}
```