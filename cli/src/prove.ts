import { CircuitScaffold } from "./scaffold";
import { getFunctionFromTs, getUint8ArrayFromBuffer, saveBufferToFile, saveJsonToFile } from "./utils";

export const prove = async (path: string, options: { pk: string, stats: boolean, proof: string, instances:string }) => {
    const circuit = await getFunctionFromTs(path);
    const pkArr = getUint8ArrayFromBuffer(options.pk);
    const scaffold = new CircuitScaffold(true);
    scaffold.newCircuitFromConfig(circuit.config);
    scaffold.loadParamsAndPk(pkArr);
    try {
        await scaffold.populateCircuit(circuit.circuit, circuit.inputs);
        const proof = scaffold.prove();
        saveBufferToFile(Buffer.from(proof), options.proof);
        if (options.stats) console.log(scaffold.getCircuitStats());
        const instances = scaffold.getInstances().map((instance: string) => "0x" + BigInt(instance).toString(16));
        saveJsonToFile(JSON.stringify(instances), options.instances);
    }
    catch (e) {
        console.error(e);
    }
}