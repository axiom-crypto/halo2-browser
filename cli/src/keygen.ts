import { CircuitScaffold } from "./scaffold";
import { getFunctionFromTs, getRunCircuitFromTs, saveBufferToFile } from "./utils";

export const keygen = async (path: string, options: { pk: string, vk: string, circuit: string }) => {
    const circuit = await getFunctionFromTs(path);
    let scaffold = new CircuitScaffold(true);
    scaffold.runCircuit = await getRunCircuitFromTs(options.circuit);
    scaffold.newCircuitFromConfig(circuit.config);
    try {
        await scaffold.populateCircuit(circuit.circuit, circuit.inputs);
        await scaffold.keygen();
        const vk = scaffold.exportVk();
        saveBufferToFile(vk, options.vk)
        const pk = scaffold.exportPk();
        saveBufferToFile(pk, options.pk)
    }
    catch (e) {
        console.error(e);
    }
}