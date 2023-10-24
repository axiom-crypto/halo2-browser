export const convertToBytes32 = (inputArray: Uint8Array): `0x${string}`[] => {
    let result: `0x${string}`[] = [];
    for (let i = 0; i < inputArray.length; i += 32) {
      let slice = inputArray.slice(i, i + 32);
      let hex = ('0x' + Buffer.from(slice).toString('hex').padStart(64, '0')) as `0x${string}`;
      result.push(hex);
    }
    return result;
  }
  
export const convertToBytes = (inputArray: Uint8Array): string => {
    let hex = Buffer.from(inputArray).toString('hex');
    return hex;
}