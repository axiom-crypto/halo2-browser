export const joinArrays = (...args: any[]) => {
  const result = [];

  for (const arg of args) {
    if (Array.isArray(arg)) {
      result.push(...arg);
    } else {
      result.push(arg);
    }
  }

  return result;
}

export const convertInput = (input: any): any => {
  if (typeof input === "string") {
    return BigInt(input).toString();
  } else if (Array.isArray(input)) {
    return input.map(convertInput);
  } else if (typeof input === "number") {
    return input.toString();
  } else if (typeof input === 'bigint') {
    return input.toString();
  }
}

export const convertBase64ToUint8Arr = (b64str: string) => {
  const binstr = atob(b64str);
  const buf = new Uint8Array(binstr.length);
  Array.prototype.forEach.call(binstr, (ch, i) => {
    buf[i] = ch.charCodeAt(0);
  });
  return buf;
}

export const getInputFunctionSignature = (inputs: string) => {
  const parsedInputs = JSON.parse(inputs);
  let newCode = "";
  for (const key of Object.keys(parsedInputs)) {
    newCode += `${key},`;
  };
  newCode = newCode.slice(0, -1);
  return newCode;
}

export const createInterfaceFromInputs = (inputs: string) => {
  const json = JSON.parse(inputs);
  let tsInterface = 'export interface CircuitInputs {\n';
  for (const key in json as {[key: string]: any}) {
    tsInterface += `  ${key}: ${typeof (json as {[key: string]: any})[key]};\n`;
  }
  tsInterface += '}\n';
  return tsInterface;
}

export const lowercase = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

export const uppercase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}