export const run = async (halo2wasm: any, halo2Lib: any, config: any, circuit: any, inputs: any) => {
    const { Halo2CircuitRunner } = await import("@axiom-crypto/halo2-lib-js");
    console.log("This is being compiled JIT and used to run the circuit!")
    await Halo2CircuitRunner(halo2wasm, halo2Lib, config).run(circuit, inputs);
}