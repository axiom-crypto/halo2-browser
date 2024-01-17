import { CircuitConfig, Halo2Wasm } from "../../pkg/web/halo2_wasm";
import { CircuitScaffoldContext } from "./types";

export abstract class BaseCircuitScaffold {
    protected halo2wasm!: Halo2Wasm;
    protected config: CircuitConfig;
    protected shouldTime: boolean;
    protected proof: Uint8Array | null = null;
    protected loadedVk: boolean;
    protected context: CircuitScaffoldContext;

    protected timeStart(name: string) {
        if (this.shouldTime) console.time(name);
    }

    protected timeEnd(name: string) {
        if (this.shouldTime) console.timeEnd(name);
    }

    protected setContext(context: CircuitScaffoldContext) {
        this.context = context;
    }

    newCircuitFromConfig(config: CircuitConfig) {
        this.config = config;
        this.halo2wasm.config(config);
    }

    async loadParams() {
        const kzgParams = await this.context.getKzgParams(this.config.k);
        this.halo2wasm.loadParams(kzgParams);
    }

    async loadParamsAndVk(vk: Uint8Array) {
        await this.loadParams();
        this.halo2wasm.loadVk(vk);
        this.loadedVk = true;
    }

    mock() {
        this.timeStart("Mock proving")
        this.halo2wasm.mock()
        this.timeEnd("Mock proving")
    }

    async keygen() {
        await this.loadParams();
        this.timeStart("VK generation")
        this.halo2wasm.genVk();
        this.timeEnd("VK generation")
        this.timeStart("PK generation")
        this.halo2wasm.genPk();
        this.timeEnd("PK generation")
    }

    prove() {
        if (this.loadedVk) {
            this.timeStart("PK generation");
            this.halo2wasm.genPk();
            this.timeEnd("PK generation");
        }
        this.timeStart("SNARK proof generation")
        let proof = this.halo2wasm.prove();
        this.timeEnd("SNARK proof generation")
        this.proof = proof;
        return proof;
    }

    verify(proof: Uint8Array) {
        this.timeStart("Verify SNARK proof")
        this.halo2wasm.verify(proof);
        this.timeEnd("Verify SNARK proof")
    }

    getInstances(): string[] {
        return this.halo2wasm.getInstanceValues(0);
    }

    getCircuitStats() {
        return this.halo2wasm.getCircuitStats();
    }

    getHalo2Vk() {
        const vk = this.halo2wasm.getVk();
        return new Uint8Array(vk);
    }

    exportHalo2Vk() {
        const vk_arr = this.halo2wasm.getVk();
        const vk = "0x" + Buffer.from(vk_arr).toString('hex');
        const blob = new Blob([vk], { type: "text/plain" });
        return blob;
    }

    getPartialVk() {
        return this.halo2wasm.getPartialVk();
    }

    exportPartialVk() {
        const vk = this.halo2wasm.getPartialVk();
        const hexVk = "0x" + Buffer.from(vk).toString("hex");
        const blob = new Blob([hexVk], { type: "text/plain" });
        return blob;
    }

    getProof() {
        if (!this.proof) throw new Error("No proof to export");
        return this.proof;
    }

    exportProof() {
        const proof = this.getProof();
        const proofHex = "0x" + Buffer.from(proof).toString('hex');
        const blob = new Blob([proofHex], { type: "text/plain" });
        return blob;
    }
}
