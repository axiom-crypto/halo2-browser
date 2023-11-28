import os
import subprocess
import re
import sys

def camel_to_snake(name):
    str1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', str1).lower()

script_dir = os.path.dirname(os.path.abspath(__file__))
circuit_dir = os.path.join(script_dir, 'circuits')
vk_dir = os.path.join(script_dir, 'data')

def replace_text_in_file(file_path, out_path):
    with open(file_path, 'r') as file:
        file_data = file.read()

    file_data = re.sub(r'constant\((.*?)\)', r'\1', file_data)
    with open(out_path, 'w') as file:
        file.write(file_data)

def test_constant(filename):
    file_path = os.path.join(circuit_dir, filename)
    if os.path.isfile(file_path):
        test_name = camel_to_snake(filename.split('.')[0])
        if "constant" in filename:
            return None
        const_file_path = os.path.join(circuit_dir, "constant." + filename)
        replace_text_in_file(file_path, const_file_path)
        print("Testing " + test_name)
        subprocess.run(["pnpm", 'halo2-wasm', 'keygen', file_path, "-c", "./tests/run.ts"], capture_output=True)
        subprocess.run(["pnpm", 'halo2-wasm', 'keygen', const_file_path, "-c", "./tests/run.ts", "-vk", "./data/const_vk.bin"], capture_output=True)
        result = subprocess.run(['diff', './data/vk.bin', './data/const_vk.bin'], capture_output=True)
        if result.returncode != 0:
            return (test_name, False)
        return (test_name, True)



if len(sys.argv) > 1:
    test_constant(sys.argv[1] + ".ts")
else:
    passedTests = []
    failTests = []
    for filename in os.listdir(circuit_dir):
        result = test_constant(filename)
        if result is not None:
            if result[1]:
                passedTests.append(result[0])
            else:
                failTests.append(result[0])
    print("Passed tests:")
    print(passedTests)
    print("Failed tests:")
    print(failTests)
    if len(failTests) > 0:
        sys.exit(1)