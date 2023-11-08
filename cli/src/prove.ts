import { CircuitScaffold } from "./scaffold";
import { getFunctionFromTs, getRunCircuitFromTs, getUint8ArrayFromBuffer, readJsonFromFile, saveBufferToFile, saveJsonToFile } from "./utils";

export const prove = async (path: string, options: { pk: string, stats: boolean, proof: string, instances: string, circuit: string, config: string, inputs?: string }) => {
    const circuit = await getFunctionFromTs(path);
    const pkArr = getUint8ArrayFromBuffer(options.pk);
    let scaffold = new CircuitScaffold(true);
    scaffold.runCircuit = await getRunCircuitFromTs(options.circuit);
    scaffold.newCircuitFromConfig(circuit.config);
    scaffold.loadParamsAndPk(pkArr);
    let circuitInputs = circuit.inputs;
    if (options.inputs) {
        circuitInputs = readJsonFromFile(options.inputs);
    }
    try {
        await scaffold.populateCircuit(circuit.circuit, circuitInputs);
        const proof = scaffold.prove();
        saveBufferToFile(Buffer.from(proof), options.proof, "proof");
        if (options.stats) console.log(scaffold.getCircuitStats());
        const instances = scaffold.getInstances().map((instance: string) => "0x" + BigInt(instance).toString(16));
        saveJsonToFile(JSON.stringify(instances), options.instances, "instances");
    }
    catch (e) {
        console.error(e);
    }
}