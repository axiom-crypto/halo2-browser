//@ts-ignore -- to avoid halo2-lib-js being a dependency of the cli
export const circuit = async (halo2Lib: Halo2Lib, inputs: {x: number}) => {
    const {add, sub, mul, constant, witness, log, rangeCheck, makePublic, isLessThan} = halo2Lib;
    const x = witness(inputs.x);
    const a = witness(1);
    const b = witness(2);
    const c = witness(3);
    const d = add(a, b);
    const e = sub(c, b);
    const f = mul(d, e);
    const g = add(f, x);
    log(g);
    rangeCheck(witness(50), 8)
    rangeCheck(witness(50), 8)
    isLessThan(constant(1), constant(9), "4")
    // makePublic(g);
    makePublic(constant(1));
}

export const config = {
    k: 10,
    numAdvice: 4,
    numLookupAdvice: 1,
    numInstance: 1,
    numLookupBits: 9,
    numVirtualInstance: 1,
}

export const inputs = {
    x: 9,
}