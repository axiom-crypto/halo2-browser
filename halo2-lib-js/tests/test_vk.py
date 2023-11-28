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

def test_vk(filename):
    file_path = os.path.join(circuit_dir, filename)
    if os.path.isfile(file_path):
        test_name = camel_to_snake(filename.split('.')[0])
        test_type = filename.split('.')[-2]
        rust_test = "tests::" + test_type + "::test_" + test_name
        print("Testing " + test_name)
        subprocess.run(["npx", 'halo2-wasm', 'keygen', file_path, "-c", "./tests/run.ts"], capture_output=True)
        subprocess.run(['cargo', 'test', rust_test, "--quiet", "--", "--exact"], capture_output=True)
        result = subprocess.run(['diff', './data/vk.bin', '../halo2-wasm/vk.bin'], capture_output=True)
        if result.returncode != 0:
            return (test_name, False)
        return (test_name, True)



if len(sys.argv) > 1:
    test_vk(sys.argv[1] + ".ts")
else:
    passedTests = []
    failTests = []
    for filename in os.listdir(circuit_dir):
        result = test_vk(filename)
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