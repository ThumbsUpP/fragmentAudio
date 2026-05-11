# Stable-TS Service

A Flask alignment worker that uses stable-ts to align audio with subtitles and generate word-level timestamps.

During the v2 migration this service intentionally remains separate from the Node monolith because it owns the Python/Whisper audio runtime. It should be treated as a technical worker called by `apps/api`, not as the source of application/database business logic.

## Features

- Aligns audio files with SRT subtitle files using stable-ts
- Generates word-level timestamps for each subtitle segment
- Generates pinyin for Chinese words
- Accepts video ID and video URL parameters so callers can correlate responses with their own records

## API Endpoints

### POST /stable-ts

Processes an audio file and SRT file to generate word-level alignment timestamps.

**Form Parameters:**

- `audio`: (required) The audio file to process
- `srt`: (required) The SRT subtitle file
- `videoId`: (optional) A unique identifier for the video
- `videoUrl`: (optional) The URL of the video

**Response:**

```json
{
  "segments": [
    {
      "id": "segment-uuid",
      "text": "字幕文本",
      "start": 0,
      "end": 2.4,
      "words": [
        {
          "word": "字幕",
          "pinyin": "zìmù",
          "start": 0.1,
          "end": 0.8
        }
      ]
    }
  ],
  "videoId": "...",
  "videoUrl": "..."
}
```

## Installation

```bash
pip install -r requirements.txt
```

## Running the Service

```bash
python app.py
```

The service runs on port `5000` by default.

## Manual pinyin/alignment check

`scripts/check_pinyin.py` is a manual script, not a pytest test file:

```bash
python scripts/check_pinyin.py path/to/audio.mp3 path/to/subtitles.srt
```

## Tests

```bash
pytest
```

## Example Usage

```bash
curl -X POST \
  -F "audio=@path/to/audio.mp3" \
  -F "srt=@path/to/subtitles.srt" \
  -F "videoId=my-video-123" \
  -F "videoUrl=https://example.com/videos/my-video-123" \
  http://localhost:5000/stable-ts
```
