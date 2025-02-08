from werkzeug.utils import secure_filename
import os
import zipfile
import tempfile
import json

def save_file(file) -> str:
    filename = secure_filename(file.filename)
    file_path = os.path.join('/tmp', filename)
    file.save(file_path)
    return file_path

def create_zip_file(audio_chunks, timestamps) -> str:
    temp_dir = tempfile.gettempdir()
    zip_path = os.path.join(temp_dir, 'audio_chunks.zip')
    with zipfile.ZipFile(zip_path, 'w') as zf:
        for i, chunk in enumerate(audio_chunks):
            chunk_filename = f'chunk_{i}.wav'
            zf.writestr(chunk_filename, chunk)
        json_data = json.dumps(timestamps)
        zf.writestr('timestamps.json', json_data)
    return zip_path
