export const DEFAULT_CODE = JSON.parse("\"//   _    _       _      ___  _____  ______ _____  _      \\n//  | |  | |     | |    |__ \\\\|  __ \\\\|  ____|  __ \\\\| |     \\n//  | |__| | __ _| | ___   ) | |__) | |__  | |__) | |     \\n//  |  __  |/ _` | |/ _ \\\\ / /|  _  /|  __| |  ___/| |     \\n//  | |  | | (_| | | (_) / /_| | \\\\ \\\\| |____| |    | |____ \\n//  |_|  |_|\\\\__,_|_|\\\\___/____|_|  \\\\_\\\\______|_|    |______|  \\n//\\n// Welcome to halo2repl! Docs at: https://docs.axiom.xyz/zero-knowledge-proofs/halo2repl\\n//\\n// We've prepared a small puzzle for you! The inputs are:\\n// * `arr`      -- an array of length 10\\n// * `startIdx` -- an index guaranteed to be in [0, 10)\\n// * `endIdx`   -- an index guaranteed to be in [0, 10) so that startIdx <= endIdx\\n//\\n// The goal is to write a ZK circuit constraining a length 10 output array `out` so that\\n// * the first `endIdx - startIdx` entries of `out` are the subarray `arr[startIdx:endIdx]`\\n// * all other entries of `out` are 0.\\n//\\n// The first 12 public input/output elements should be the entries of `arr`, \\n// `startIdx`, and `endIdx`. The next 10 should be the entries of `out`.\\n\\n// load the Javascript inputs as witnesses into the ZK circuit\\nconst input = arr.map(witness);\\nconst start = witness(startIdx);\\nconst end = witness(endIdx);\\n\\n// set the logical inputs as public inputs in ZK\\ninput.map(makePublic);\\nmakePublic(start);\\nmakePublic(end);\\n\\nconst numInRange = sub(end, start);\\n\\nlet out = [];\\nfor (let i = 0; i < 10; i++) {\\n    const idx = mod(add(start, constant(i)), constant(10));\\n    const isIdxInRange = isLessThan(constant(i), numInRange);\\n    const el = selectFromIdx(input, idx);\\n    const res = mul(isIdxInRange, el);\\n    out.push(res);\\n}\\n\\n// set the logical outputs as public outputs in ZK\\nout.map(makePublic);\\n\\n// This solution uses 9206 total advice cells. Have a better solution? \\n// We'd love to chat -- DM us at @axiom_xyz on Twitter!\"")
export const DEFAULT_INPUT = JSON.parse("\"{\\n    \\\"arr\\\": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],\\n    \\\"startIdx\\\": 6,\\n    \\\"endIdx\\\": 9\\n}\"");