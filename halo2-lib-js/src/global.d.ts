import { Halo2LibWasm, Halo2Wasm } from "@axiom-crypto/halo2-wasm/web";

declare global {
    namespace circuit {
        var halo2wasm: Halo2Wasm;
        var halo2lib: Halo2LibWasm;
        var silent: boolean;
    }
}