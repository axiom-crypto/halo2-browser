import { Halo2Wasm, initPanicHook, Halo2LibWasm, CircuitConfig } from "../../pkg/js/halo2_wasm";
import { getKzgParams } from "../kzg";
import { DEFAULT_CIRCUIT_CONFIG } from "../shared";

export { CircuitConfig, DEFAULT_CIRCUIT_CONFIG, Halo2Wasm, Halo2LibWasm, getKzgParams };

export const getHalo2Wasm = () => {
  initPanicHook();
  const halo2wasm = new Halo2Wasm();
  return halo2wasm;
}

export const getHalo2LibWasm = (halo2wasm: Halo2Wasm) => {
  const halo2libwasm = new Halo2LibWasm(halo2wasm);
  return halo2libwasm;
}

export abstract class CircuitScaffold {
  protected halo2wasm: Halo2Wasm;
  protected config: CircuitConfig;
  protected shouldTime: boolean;
  protected proof: Uint8Array | null = null;
  protected loadedVk: boolean;

  constructor(options?: { config?: CircuitConfig, shouldTime?: boolean }) {
    this.halo2wasm = getHalo2Wasm();
    this.config = options?.config ?? { ...DEFAULT_CIRCUIT_CONFIG };
    this.shouldTime = options?.shouldTime ?? false;
    this.loadedVk = false;
    this.halo2wasm.config(this.config);
  }

  protected timeStart(name: string) {
    if (this.shouldTime) console.time(name);
  }

  protected timeEnd(name: string) {
    if (this.shouldTime) console.timeEnd(name);
  }

  newCircuitFromConfig(config: CircuitConfig) {
    this.config = config;
    this.halo2wasm.config(config);
  }

  async loadParams(){
    const kzgParams = await getKzgParams(this.config.k);
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
}
