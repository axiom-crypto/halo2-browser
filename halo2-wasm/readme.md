# halo2-wasm

This repository aims to streamline the process of building WASM modules from zero-knowledge proof circuits written on top of [halo2-lib](https://github.com/axiom-crypto/halo2-lib). To discuss or collaborate, join our community on [Telegram](https://t.me/halo2browser).

## Getting Started

For a brief overview on writing `halo2-lib` circuits, see this [doc](https://docs.axiom.xyz/zero-knowledge-proofs/getting-started-with-halo2). In addition to the `halo2-lib` setup, you will need `wasm-pack` installed:

```
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

The [`template`](./template) folder includes everything you need to turn your circuit into a WASM bundle. In particular, [`template/src/lib.rs`](./template/src/lib.rs) is an example of a simple circuit that uses the context of a `Halo2Wasm` struct. You can then build your WASM bundle (from the `template` subdirectory) with:

```
./scripts/build.sh <PLATFORM>
```

where `<PLATFORM>` is either `nodejs` or `web`.

### Multithreading

Halo2 uses Rayon for multithreading, and we use `wasm-bindgen-rayon` to support this in the browser. It does not work outside the browser, however, so when `nodejs` is the compilation target, Rayon will be turned off (it is enabled using the `rayon` feature flag).

## Setting up the WASM module in JS

### Web

```typescript
import {
  init,
  initThreadPool,
  initPanicHook,
  Halo2Wasm,
  MyCircuit,
} from "<IMPORT PATH>";

const main = async () => {
  //setup Halo2Wasm and MyCircuit
  await init();
  initPanicHook();
  await initThreadPool(numThreads);
  const halo2wasm = new Halo2Wasm();
  const myCircuit = new MyCircuit(halo2wasm);
};
```

### Node.js

```typescript
import { Halo2Wasm, initPanicHook, MyCircuit } from "<IMPORT PATH>";

const main = async () => {
  //setup Halo2Wasm and MyCircuit
  initPanicHook();
  const halo2wasm = new Halo2Wasm();
  const myCircuit = new MyCircuit(halo2wasm);
};
```

You can now run `MyCircuit` witness generation with `myCircuit.run()` (following the example in the `template` subdirectory). You can then call any of the `Halo2Wasm` operations (`mock`, `keygen`, `prove`, etc.),

## halo2-js

`halo2-js` is a Typescript wrapper for easily using the `halo2-wasm` module's functions (ie. proving, keygen, etc). Check out the [repo](https://github.com/axiom-crypto/halo2-js) for more info.

## Benchmarks

Coming soon!

## Projects built with `halo2-wasm`

- [halo2-nn-wasm](https://github.com/metavind/halo2-nn-wasm)

## Acknowledgements

This work would not be possible without [Nalin's](https://twitter.com/nibnalin) guide on using raw halo2 in WASM. Check out his guide [here](https://zcash.github.io/halo2/user/wasm-port.html).