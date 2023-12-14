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

## Usage

```
Usage: halo2-wasm [options] [command]

halo2-wasm CLI

Options:
  -V, --version                    output the version number
  -h, --help                       display help for command

Commands:
  mock [options] <circuit path>    circuit mock prove
  keygen [options] <circuit path>  circuit keygen
  prove [options] <circuit path>   circuit prove
  verify [options] <circuit path>  circuit verify
  help [command]                   display help for command
```

## Commands

### mock

```
Usage: halo2-wasm mock [options] <circuit path>

circuit mock prove

Arguments:
  circuit path                      circuit path

Options:
  -s, --stats                       print stats
  -c, --circuit [circuit scaffold]  circuit scaffold
  -in, --inputs [inputs]            inputs
  -h, --help                        display help for command
```

### keygen

```
Usage: halo2-wasm keygen [options] <circuit path>

circuit keygen

Arguments:
  circuit path                      circuit path

Options:
  -pk, --pk [pk path]               pk path (default: "data/pk.bin")
  -vk, --vk [vk path]               vk path (default: "data/vk.bin")
  -c, --circuit [circuit scaffold]  circuit scaffold
  -h, --help                        display help for command
```

### prove

```
Usage: halo2-wasm prove [options] <circuit path>

circuit prove

Arguments:
  circuit path                      circuit path

Options:
  -pk, --pk [pk path]               pk path (default: "data/pk.bin")
  -p, --proof [proof path]          proof path (default: "data/proof.bin")
  -i, --instances [instances]       instances (default: "data/instances.json")
  -s, --stats                       print stats
  -c, --circuit [circuit scaffold]  circuit scaffold
  -in, --inputs [inputs]            inputs
  -h, --help                        display help for command
```

### verify

```
Usage: halo2-wasm verify [options] <circuit path>

circuit verify

Arguments:
  circuit path                 circuit path

Options:
  -vk, --vk [vk path]          vk path (default: "data/vk.bin")
  -p, --proof [proof path]     proof path (default: "data/proof.bin")
  -i, --instances [instances]  instances (default: "data/instances.json")
  -h, --help                   display help for command
```

