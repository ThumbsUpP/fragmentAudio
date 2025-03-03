# Stable-TS Service

A Flask service that uses stable-ts to align audio with subtitles and generate word-level timestamps. The service now integrates with the video-db service to store alignment results.

## Features

- Aligns audio files with SRT subtitle files using stable-ts
- Generates word-level timestamps for each subtitle segment
- Accepts video ID and video URL parameters to associate with the alignment
- Automatically saves alignment results to the video-db service

## API Endpoints

### POST /stable-ts

Processes an audio file and SRT file to generate word-level alignment timestamps.

**Form Parameters:**

- `audio`: (required) The audio file to process
- `srt`: (required) The SRT subtitle file
- `videoId`: (optional) A unique identifier for the video
- `videoUrl`: (optional) The URL of the video

Both `videoId` and `videoUrl` must be provided to save the results to the video-db service.
If either is missing, the alignment will still be performed but the results won't be saved to the database.

**Response:**

```json
{
  "alignment": [...],  // The alignment results
  "videoId": "...",    // The video ID used
  "videoUrl": "...",   // The video URL used
  "savedToDb": true,   // Whether the results were saved to the database
  "dbRecord": {...}    // The database record (if saved successfully)
}
```

## Environment Variables

- `VIDEO_DB_URL`: URL of the video-db service (default: `http://localhost:3000/api/videos`)

## Installation

```bash
pip install -r requirements.txt
```

## Running the Service

```bash
python app.py
```

The service will run on port 5000 by default.

## Example Usage

Using curl to send a request with video ID and URL:

```bash
curl -X POST \
  -F "audio=@path/to/audio.mp3" \
  -F "srt=@path/to/subtitles.srt" \
  -F "videoId=my-video-123" \
  -F "videoUrl=https://example.com/videos/my-video-123" \
  http://localhost:5000/stable-ts
```
