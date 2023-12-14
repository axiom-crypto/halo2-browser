import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from "path";

const config = {
    k: 10,
    numAdvice: 20,
    numLookupAdvice: 3,
    numInstance: 1,
    numLookupBits: 9,
    numVirtualInstance: 1,
}

export const writeCircuitToFile = (circuit: string, relativePath: string) => {
    const configStr = `export const config = ${JSON.stringify(config, null, 4)}\n`;
    const inputStr = `export const inputs = {}\n`;
    const filePath = path.resolve(__dirname, "./circuits", relativePath);
    const folderPath = path.dirname(filePath);
    if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
    }
    writeFileSync(filePath, configStr + inputStr + circuit);
    console.log(`Wrote circuit to ${filePath}`);
}