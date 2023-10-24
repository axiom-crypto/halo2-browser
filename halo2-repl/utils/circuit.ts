export const parseCircuitTypes = (inputs: string) => {
    let parsedInputs = JSON.parse(inputs);
    let parsedInputKeys = Object.keys(parsedInputs);
    let code = "";
    for (let key of parsedInputKeys) {
      let val = parsedInputs[key];
      if (Array.isArray(val)) {
        const arrType = typeof val[0];
        code += `declare const ${key}: ${arrType}[];\n`;
      }
      else {
        const type = typeof val;
        code += `declare const ${key}: ${type};\n`;
      }
    }
    return code;
}