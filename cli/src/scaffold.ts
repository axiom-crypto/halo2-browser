import { getHalo2Wasm, getHalo2LibWasm, Halo2LibWasm, CircuitScaffold as ICircuitScaffold, Halo2Wasm, CircuitConfig } from "@axiom-crypto/halo2-wasm/js/";

export class CircuitScaffold extends ICircuitScaffold {
    halo2Lib!: Halo2LibWasm;

    constructor(shouldTime: boolean) {
        super({ shouldTime });
        this.halo2wasm = getHalo2Wasm();
    }

    newCircuitFromConfig(config: CircuitConfig): void {
        super.newCircuitFromConfig(config);
        if (this.halo2Lib) this.halo2Lib.free();
        this.halo2Lib = getHalo2LibWasm(this.halo2wasm);
    }

    runCircuit = async (halo2wasm: Halo2Wasm, halo2Lib: Halo2LibWasm, config: CircuitConfig, circuit: any, inputs: any) => {
        console.error("Please specify circuit runner!")
        process.exit(1);
    }

    populateCircuit = async (circuit: any, inputs: any) => {
        this.newCircuitFromConfig(this.config);
        this.timeStart("Witness generation");
        await this.runCircuit(this.halo2wasm, this.halo2Lib, this.config, circuit, inputs);
        this.timeEnd("Witness generation");
        this.halo2wasm.assignInstances();
    }

    exportVkBuffer() {
        const vk = this.halo2wasm.getVk();
        return Buffer.from(vk);
    }

    exportPkBuffer() {
        const pk = this.halo2wasm.getPk();
        return Buffer.from(pk);
    }

    async loadParamsAndPk(pk: Uint8Array) {
        await this.loadParams();
        this.halo2wasm.loadPk(pk);
    }

    exportProofBuffer() {
        const proof = this.halo2wasm.prove();
        return Buffer.from(proof);
    }

    loadInstances(instances: string[]) {
        const instanceCells = instances.map(instance => this.halo2Lib.witness(BigInt(instance).toString()));
        this.halo2wasm.setInstances(new Uint32Array(instanceCells), 0);
    }

    loadVk(vk: Uint8Array) {
        this.halo2wasm.loadVk(vk);
    }
}