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
        rust_test = "tests::gate::test_" + test_name
        print("Testing " + test_name)
        subprocess.run(['halo2-wasm', 'keygen', file_path], stdout = subprocess.DEVNULL)
        subprocess.run(['cargo', 'test', rust_test, "--quiet", "--", "--exact"], stdout = subprocess.DEVNULL)
        subprocess.run(['diff', './data/vk.bin', '../halo2-wasm/vk.bin'])



if len(sys.argv) > 1:
    test_vk(sys.argv[1] + ".ts")
else:
    for filename in os.listdir(circuit_dir):
        test_vk(filename)