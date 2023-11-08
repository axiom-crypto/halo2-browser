import { Command } from 'commander';
import { mock } from './mock';
import { keygen } from './keygen';
import { prove } from './prove';
import { verify } from './verify';

const program = new Command();

program
    .name("halo2-wasm")
    .version("0.1.0")
    .description("halo2-wasm CLI")

program
    .command("mock")
    .description("circuit mock prove")
    .argument("<circuit path>", "circuit path")
    .option("-s, --stats", "print stats")
    .option("-c, --circuit [circuit scaffold]", "circuit scaffold")
    .option("-in, --inputs [inputs]", "inputs")
    .action(mock)

program
    .command("keygen")
    .description("circuit keygen")
    .argument("<circuit path>", "circuit path")
    .option("-pk, --pk [pk path]", "pk path", "data/pk.bin")
    .option("-vk, --vk [vk path]", "vk path", "data/vk.bin")
    .option("-c, --circuit [circuit scaffold]", "circuit scaffold")
    .action(keygen)

program
    .command("prove")
    .description("circuit prove")
    .argument("<circuit path>", "circuit path")
    .option("-pk, --pk [pk path]", "pk path", "data/pk.bin")
    .option("-p, --proof [proof path]", "proof path", "data/proof.bin")
    .option("-i, --instances [instances]", "instances", "data/instances.json")
    .option("-s, --stats", "print stats")
    .option("-c, --circuit [circuit scaffold]", "circuit scaffold")
    .option("-in, --inputs [inputs]", "inputs")
    .action(prove)

program
    .command("verify")
    .description("circuit verify")
    .argument("<circuit path>", "circuit path")
    .option("-vk, --vk [vk path]", "vk path", "data/vk.bin")
    .option("-p, --proof [proof path]", "proof path", "data/proof.bin")
    .option("-i, --instances [instances]", "instances", "data/instances.json")
    .action(verify)

program.parseAsync(process.argv)