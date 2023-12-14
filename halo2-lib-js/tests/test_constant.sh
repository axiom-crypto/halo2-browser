rm -rf tests/circuits
mkdir tests/circuits
npx ts-node tests/range.ts
npx ts-node tests/gate.ts
python3 tests/test_constant.py