import { Halo2CircuitRunner } from "@axiom-crypto/halo2-lib-js";
import { CircuitScaffold } from "./scaffold";
import { getRunCircuitFromTs, getFunctionFromTs } from "./utils";

export const mock = async (path: string, options: { stats: boolean, circuit: string }) => {
    const circuit = await getFunctionFromTs(path);
    let scaffold = new CircuitScaffold(true);
    if (options.circuit) {
        scaffold.runCircuit = await getRunCircuitFromTs(options.circuit);
    }
    scaffold.newCircuitFromConfig(circuit.config);
    try {
        await scaffold.populateCircuit(circuit.circuit, circuit.inputs);
        scaffold.mock();
        if (options.stats) console.log(scaffold.getCircuitStats());
    }
    catch (e) {
        console.error(e);
    }
}