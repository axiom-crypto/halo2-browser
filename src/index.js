let Halo2Wasm = null;
let Halo2LibWasm = null;
let init_panic_hook = null;
let initThreadPool = null;
let CircuitStats = null;
let CircuitConfig = null;
let wbg_rayon_PoolBuilder = null;
let InitInput = null;
let InitOutput = null;
let SyncInitInput = null;
let initSync = null;

if (typeof window !== "undefined") {
  ({
    Halo2Wasm,
    Halo2LibWasm,
    init_panic_hook,
    initThreadPool,
    CircuitStats,
    CircuitConfig,
    wbg_rayon_PoolBuilder,
    InitInput,
    InitOutput,
    SyncInitInput,
    initSync,
  } = require('./web/halo2_wasm'));
} else {
  ({
    Halo2Wasm,
    Halo2LibWasm,
    init_panic_hook,
    CircuitStats,
    CircuitConfig,
  } = require('./js/halo2_wasm'));
}

export {
  Halo2Wasm,
  Halo2LibWasm,
  init_panic_hook,
  initThreadPool,
  CircuitStats,
  CircuitConfig,
  wbg_rayon_PoolBuilder,
  InitInput,
  InitOutput,
  SyncInitInput,
  initSync,
};
