import { CircuitScaffold } from "./scaffold";
import { getRunCircuitFromTs, getFunctionFromTs, readJsonFromFile } from "./utils";

export const mock = async (path: string, options: { stats: boolean, circuit: string, inputs?: string }) => {
    const circuit = await getFunctionFromTs(path);
    let scaffold = new CircuitScaffold(true);
    scaffold.runCircuit = await getRunCircuitFromTs(options.circuit);
    scaffold.newCircuitFromConfig(circuit.config);
    let circuitInputs = circuit.inputs;
    if (options.inputs) {
        circuitInputs = readJsonFromFile(options.inputs);
    }
    try {
        await scaffold.populateCircuit(circuit.circuit, circuitInputs);
        scaffold.mock();
        if (options.stats) console.log(scaffold.getCircuitStats());
    }
    catch (e) {
        console.error(e);
    }
}