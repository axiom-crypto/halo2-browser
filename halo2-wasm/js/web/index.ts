import init, {
  initThreadPool,
  initPanicHook,
  Halo2Wasm,
  Halo2LibWasm,
  CircuitConfig,
  Bn254FqPoint,
  Bn254G1AffinePoint,
  Bn254G2AffinePoint,
  JsCircuitBn254Fq2,
  JsCircuitBn254G1Affine,
  JsCircuitBn254G2Affine,
  JsCircuitSecp256k1Affine,
  JsCircuitValue256,
  Secp256k1AffinePoint,
} from "../../pkg/web/halo2_wasm";
import { getKzgParams } from "./kzg";
import { DEFAULT_CIRCUIT_CONFIG } from "../shared";
import { BaseCircuitScaffold } from "../shared/scaffold";

export {
  CircuitConfig,
  DEFAULT_CIRCUIT_CONFIG,
  Halo2Wasm,
  Halo2LibWasm,
  getKzgParams,
  Bn254FqPoint,
  Bn254G1AffinePoint,
  Bn254G2AffinePoint,
  JsCircuitBn254Fq2,
  JsCircuitBn254G1Affine,
  JsCircuitBn254G2Affine,
  JsCircuitSecp256k1Affine,
  JsCircuitValue256,
  Secp256k1AffinePoint
};

export const getHalo2Wasm = async (numThreads: number) => {
  await init();
  initPanicHook();
  if (numThreads !== 0) {
    await initThreadPool(numThreads);
  }
  const halo2wasm = new Halo2Wasm();
  return halo2wasm;
}

export const getHalo2LibWasm = (halo2wasm: Halo2Wasm) => {
  const halo2libwasm = new Halo2LibWasm(halo2wasm);
  return halo2libwasm;
}

export abstract class CircuitScaffold extends BaseCircuitScaffold {
  constructor(options?: { config?: CircuitConfig, shouldTime?: boolean }) {
    super();
    this.config = options?.config ?? { ...DEFAULT_CIRCUIT_CONFIG };
    this.shouldTime = options?.shouldTime ?? false;
    this.loadedVk = false;
    this.setContext({getKzgParams})
  }

  async setup(numThreads: number) {
    this.halo2wasm = await getHalo2Wasm(numThreads);
    this.halo2wasm.config(this.config);
  }
}
