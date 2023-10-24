import prettier from 'prettier/standalone';
import parserTypescript from 'prettier/parser-typescript';
import { Halo2CircuitRunner, captureConsoleOutput } from '@axiom-crypto/halo2-js';
import { Halo2Lib } from '@axiom-crypto/halo2-js';
import { Halo2LibWasm, getHalo2LibWasm, CircuitScaffold, getKzgParams, DEFAULT_CIRCUIT_CONFIG } from '@axiom-crypto/halo2-wasm/web'


export class Halo2Repl extends CircuitScaffold {

    private code: string;
    private inputs: string;
    private halo2Lib!: Halo2LibWasm;
    public stopConsoleCapture: () => number[];

    constructor() {
        super({ shouldTime: true });
        this.stopConsoleCapture = () => [];
        this.code = "";
        this.inputs = "";
    }

    async setup(numThreads: number) {
        await super.setup(numThreads);
        this.halo2Lib = getHalo2LibWasm(this.halo2wasm);
    }

    async populateCircuit(rawCode: string, appInputs: string) {
        this.code = rawCode + "\n";
        this.inputs = appInputs;
        this.newCircuitFromConfig(DEFAULT_CIRCUIT_CONFIG);
        console.time("Witness generation")
        const { config } = await Halo2CircuitRunner(this.halo2wasm, this.halo2Lib, this.config).runFromString(this.code, this.inputs)
        this.config = config;
        console.timeEnd("Witness generation")
        return this.config;
    }

    captureConsoleOutput(cb: any, log: any, time: any, timeEnd: any) {
        this.stopConsoleCapture = captureConsoleOutput(cb, log, time, timeEnd);
    }

    getVk() {
        const vk = this.halo2wasm.getVk();
        return new Uint8Array(vk);
    }

    async exportCircuitCode() {
        if (!this.code) {
            console.log("Need to run populate circuit first");
            return;
        }
        let halo2Lib = new Halo2Lib(this.halo2wasm, this.halo2Lib);
        let halo2libFns = Object.keys(halo2Lib).filter(fn => this.code.includes(fn)).join(", ");
        let imports = `import { Halo2Lib } from "@axiom-crypto/halo2-js";\n`
        let circuitInputImport = `import { CircuitInputs } from "./constants";\n\n`
        let codeInputs = Object.keys(JSON.parse(this.inputs)).join(", ");
        let code = `export const circuit = async (halo2Lib: Halo2Lib, halo2Data: Halo2Data, { ${codeInputs} }: CircuitInputs) => {
            const { ${halo2libFns} } = halo2Lib;
            ${this.code}
        }\n`

        let exportCode = [imports, circuitInputImport, code].join("");
        let formattedCode = prettier.format(exportCode, {
            parser: 'typescript',
            plugins: [parserTypescript]
        });
        const blob = new Blob([formattedCode], { type: "text/plain" });
        return blob;
    }

    async exportCircuitConstants() {
        if (!this.code) {
            console.log("Need to run populate circuit first");
            return;
        }

        const kzgParams = await getKzgParams(this.config.k);
        this.halo2wasm.loadParams(kzgParams);
        this.halo2wasm.genVk();

        const vk_arr = this.halo2wasm.getVk();
        let vk = JSON.stringify(Array.from(vk_arr));
        vk = `export const vk = ${vk};\n`

        let config = JSON.stringify(this.config);
        config = `export const config = ${config};\n`

        let defaultInputs = `export const defaultInputs = ${this.inputs};\n`
        let defaultType = "type CircuitInputType = typeof defaultInputs;\n"
        let circuitInterface = "export interface CircuitInputs extends CircuitInputType {}\n"


        let circuitExport = [config, defaultInputs, defaultType, circuitInterface].join("\n");
        let formattedCode = prettier.format(circuitExport, {
            parser: 'typescript',
            plugins: [parserTypescript]
        });
        formattedCode += "\n" + vk;


        const blob = new Blob([formattedCode], { type: "text/plain" });
        return blob;
    }

    exportVk() {
        const vk_arr = this.halo2wasm.getVk();
        const vk = "0x" + Buffer.from(vk_arr).toString('hex');
        const blob = new Blob([vk], { type: "text/plain" });
        return blob;
    }

}