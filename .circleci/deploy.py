# save as deploy.py
import os
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

dir_path = os.path.dirname(os.path.realpath(__file__)) + "../public"

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
        print(f'MIME Type not found: {extension}')
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
