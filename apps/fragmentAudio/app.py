from flask import Flask, request, jsonify, send_file, url_for
from utils.audio_processing import process_audio
from werkzeug.utils import secure_filename
import os
import zipfile
import io
import tempfile
import json
from typing import Union
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg'}

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

@app.route('/process', methods=['POST'])
def process() -> Union[jsonify, tuple]:
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    file_path = save_file(file)
    
    # Print the file size
    file_size = os.path.getsize(file_path)
    print(f"Uploaded file size: {file_size} bytes")
    
    try:
        audio_chunks, timestamps = process_audio(file_path)
        zip_path = create_zip_file(audio_chunks, timestamps)
        download_url = url_for('download_file', filename='audio_chunks.zip', _external=True)
        return jsonify({'download_url': download_url})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename: str) -> send_file:
    return send_file(os.path.join(tempfile.gettempdir(), filename), as_attachment=True)

if __name__ == '__main__':
    port = int(os.getenv('PYDUB_PORT', 5001))
    app.run(host='0.0.0.0', port=port)
