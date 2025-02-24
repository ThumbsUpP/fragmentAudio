from flask import Flask, request, jsonify
from align import align_audio_with_srt
import os

app = Flask(__name__)

@app.route('/stable-ts', methods=['POST'])
def stable_ts():
    print('Received request')
    if 'audio' not in request.files or 'srt' not in request.files:
        return jsonify({"error": "Audio file and SRT file are required"}), 400

    audio_file = request.files['audio']
    srt_file = request.files['srt']

    print(f"Received audio file: {audio_file.filename}")
    print(f"Received SRT file: {srt_file.filename}")

    audio_path = os.path.join('/tmp', audio_file.filename)
    srt_path = os.path.join('/tmp', srt_file.filename)

    audio_file.save(audio_path)
    srt_file.save(srt_path)

    output_json = align_audio_with_srt(audio_path, srt_path)

    return jsonify(output_json)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
