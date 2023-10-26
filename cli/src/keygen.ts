import { CircuitScaffold } from "./scaffold";
import { getFunctionFromTs, saveBufferToFile } from "./utils";

export const keygen = async (path: string, options: {pk: string, vk:string}) => {
    const circuit = await getFunctionFromTs(path);
    const scaffold = new CircuitScaffold(true);
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