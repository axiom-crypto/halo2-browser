rm -rf tests/circuits
mkdir tests/circuits
pnpm ts-node tests/range.ts
pnpm ts-node tests/gate.ts
python3 tests/test_vk.py