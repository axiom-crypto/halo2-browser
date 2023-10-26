# halo2-wasm-cli

See an example circuit the CLI takes in at [src/examples/circuit.ts](./src/examples/circuit.ts)!

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
  -h, --help                        display help for command
```

### verify
```
Usage: halo2-wasm verify [options] <circuit path>

circuit verify

Arguments:
  circuit path                      circuit path

Options:
  -vk, --vk [vk path]               vk path (default: "data/vk.bin")
  -p, --proof [proof path]          proof path (default: "data/proof.bin")
  -i, --instances [instances]       instances (default: "data/instances.json")
  -c, --circuit [circuit scaffold]  circuit scaffold
  -h, --help                        display help for command
```