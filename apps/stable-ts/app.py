from flask import Flask, request, jsonify
from align import align_audio_with_srt
import os
import requests
import json
from urllib.parse import urlparse

app = Flask(__name__)

# Configure the video-db service URL
VIDEO_DB_URL = os.environ.get('VIDEO_DB_URL', 'http://localhost:3000/api/videos')

def save_to_video_db(video_id, video_url, json_data):
    """Save the alignment results to the video-db service"""
    try:
        response = requests.post(
            VIDEO_DB_URL,
            json={
                'videoId': video_id,
                'videoUrl': video_url,
                'jsonData': json_data
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code in (200, 201):
            print(f"Successfully saved data for video ID: {video_id}")
            return response.json()
        else:
            print(f"Failed to save data. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error saving to video-db: {str(e)}")
        return None

# Function removed as per user request to not extract videoId from videoUrl

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
    
    # Save to video-db only if we have both videoId and videoUrl
    db_response = None
    if video_id and video_url:
        db_response = save_to_video_db(video_id, video_url, output_json)
    
    # Return the alignment results along with database save status
    response = {
        "alignment": output_json,
        "videoId": video_id,
        "videoUrl": video_url,
        "savedToDb": db_response is not None
    }
    
    if db_response:
        response["dbRecord"] = db_response
        
    return jsonify(response)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
