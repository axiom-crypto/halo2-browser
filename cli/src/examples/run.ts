export const run = async (halo2wasm: any, halo2Lib: any, config: any, circuit: any, inputs: any) => {
    //@ts-ignore -- to avoid halo2-lib-js being a dependency of the cli
    const { Halo2CircuitRunner } = await import("@axiom-crypto/halo2-lib-js");
    await Halo2CircuitRunner(halo2wasm, halo2Lib, config).run(circuit, inputs);
} 