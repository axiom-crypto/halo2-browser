import { CircuitScaffold } from "./scaffold";
import { getFunctionFromTs, getUint8ArrayFromBuffer, readJsonFromFile } from "./utils";

export const verify = async (path: string, options: {vk: string, proof: string, instances: string}) => {
    const circuit = await getFunctionFromTs(path);
    const vkArr = getUint8ArrayFromBuffer(options.vk);
    const proof = getUint8ArrayFromBuffer(options.proof);
    const scaffold = new CircuitScaffold(true);
    scaffold.newCircuitFromConfig(circuit.config);
    await scaffold.loadParamsAndVk(vkArr);
    const instances = readJsonFromFile(options.instances);
    try {
        scaffold.loadInstances(instances);
        scaffold.verify(proof)
    }
    catch (e) {
        console.error(e);
    }
}