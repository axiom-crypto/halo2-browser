# halo2-wasm-cli

See an example circuit the CLI takes in at [src/examples/circuit.ts](./src/examples/circuit.ts)!

By default, the circuit runner from [src/examples/run.ts](./src/examples/run.ts) is used. 
To set your own circuit runner, use the `-c` option (after setting it once, it will persist until you set a different circuit runner).

Here's an example
```
halo2-wasm mock -c src/examples/run.ts src/examples/circuit.ts
# now halo2-wasm will use the previously set circuit runner
halo2-wasm mock src/examples/circuit.ts 
```

Note: to use the default circuit runner, `@axiom-crypto/halo2-lib-js` must be installed globally using `npm`. 
```
npm install -g @axiom-crypto/halo2-lib-js
```

## Installation

To use the `halo2-wasm` command, the `@axiom-crypto/halo2-wasm-cli` package must be installed globally. To do that run:
```
npm install -g @axiom-crypto/halo2-wasm-cli
```

Note: global npm installations may require sudo access. If you'd like to install `@axiom-crypto/halo2-lib-js` or `@axiom-crypto/halo2-wasm-cli` without sudo access, see this guide: [GitHub](https://github.com/sindresorhus/guides/blob/main/npm-global-without-sudo.md).

