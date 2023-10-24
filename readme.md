# halo2-browser

This is a monorepo for using the halo2 proving system in-browser using WASM. 

## Directory Structure

* [`halo2-wasm`](./halo2-wasm) - WASM bindings on top of core circuit functionality (ie. proving, keygen, etc.) that can easily be extended to include your own circuit functions
    * [`halo2-lib-wasm`](./halo2-wasm/src/halo2lib.rs) - WASM bindings for all the core [`halo2-lib`](https://github.com/axiom-crypto/halo2-lib) in-circuit operations (ie. add, sub, select_from_idx, etc.)
* [`halo-lib-js`](./halo2-lib-js) - Typescript wrapper around `halo2-lib-wasm` to facilitate writing circuits in JS/TS environments and running the circuits with `halo2-wasm`
* [`halo2-repl`](./halo2-repl) - a browser-based REPL for writing halo2 circuits in Typescript, powered by `halo2-wasm` and `halo2-lib-js`

## License

All files within this repository are licensed under the [MIT license](./LICENSE).