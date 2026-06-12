from flask import Flask, request, jsonify
from align import align_audio_with_srt
import os
from urllib.parse import urlparse

app = Flask(__name__)

@app.route('/stable-ts', methods=['POST'])
def stable_ts():
    print('Received request')
    
    # Check for required files
    if 'audio' not in request.files or 'srt' not in request.files:
        return jsonify({"error": "Audio file and SRT file are required"}), 400

    # Get video ID and URL from request
    video_id = request.form.get('videoId')
    video_url = request.form.get('videoUrl')
    
    # Log whether we have videoId and videoUrl
    if video_id and video_url:
        print(f"Received videoId: {video_id} and videoUrl: {video_url}")
    else:
        print(f"Missing videoId or videoUrl. videoId: {video_id}, videoUrl: {video_url}")

    # Process audio and SRT files
    audio_file = request.files['audio']
    srt_file = request.files['srt']

    print(f"Received audio file: {audio_file.filename}")
    print(f"Received SRT file: {srt_file.filename}")
    print(f"Video ID: {video_id}")
    print(f"Video URL: {video_url}")

    audio_path = os.path.join('/tmp', audio_file.filename)
    srt_path = os.path.join('/tmp', srt_file.filename)

    audio_file.save(audio_path)
    srt_file.save(srt_path)

    # Generate alignment
    output_json = align_audio_with_srt(audio_path, srt_path)
    # Return the alignment results along with database save status
    response = {
        "segments": output_json,
        "videoId": video_id,
        "videoUrl": video_url,
    }

    return jsonify(response)

if __name__ == "__main__":
    host = os.environ.get("STABLE_TS_HOST", "0.0.0.0")
    port = int(os.environ.get("STABLE_TS_PORT", "5000"))
    app.run(host=host, port=port)
