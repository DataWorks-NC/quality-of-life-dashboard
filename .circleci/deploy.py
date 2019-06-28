# save as deploy.py
from __future__ import print_function
from future import standard_library
standard_library.install_aliases()

import os
import sys
import platform
import mimetypes
import subprocess
from dotenv import load_dotenv, find_dotenv
from concurrent import futures
load_dotenv(find_dotenv())

mimetypes.add_type("application/vnd.ms-fontobject", ".eot")
mimetypes.add_type("application/octet-stream", ".ttf")
mimetypes.add_type("application/font-woff", ".woff")
mimetypes.add_type("application/font-woff2", ".woff2")
mimetypes.add_type("application/font-woff", ".otf")
mimetypes.add_type("image/svg+xml", ".svg")

if len(sys.argv) < 2:
    print("Must include path to the files to deploy as an argument")
dir_path = sys.argv[1]

# Create .azure directory ahead of time to avoid race condition in azure code.
try:
  os.mkdir('~/.azure')
except OSError as e:
  pass

extensions = set()
MAX_WORKERS = 20

def run_command(command):
    return print(subprocess.check_output(command))

for subdir, dirs, files in os.walk(dir_path):
    for file in files:
        filename, file_extension = os.path.splitext(file)
        extensions.add(file_extension)

commands = []
for extension in extensions:
    try:
        mime = mimetypes.types_map[extension]
    except KeyError:
        print('MIME Type not found: %s' % extension)
        continue
    command = [
        "az", 
        "storage", 
        "blob", 
        "upload-batch", 
        "--connection-string",
        os.getenv('AZURE_STORAGE_CONNECTION_STRING'),"-s", 
        "public", 
        "-d", 
        os.getenv('AZURE_DESTINATION_BLOB'), 
        "--pattern", 
        "*"+extension, 
        "--content-type", 
        mime
    ]
    commands.append(command)

workers = min(MAX_WORKERS, len(commands))
with futures.ThreadPoolExecutor(workers) as executor:
    res = executor.map(run_command, commands)
