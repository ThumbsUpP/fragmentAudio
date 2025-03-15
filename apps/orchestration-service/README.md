# Orchestration Service

This service coordinates the processing of audio files through multiple microservices in the fragmentAudio project.

## Overview

The Orchestration Service acts as a central coordinator for:
- Stable-TS alignment service
- Transcript translation service
- Video database service

It provides a unified API for clients to process audio files and their corresponding SRT files, handling the workflow between these services.

## Features

- **Audio Processing**: Coordinates the alignment of audio files with SRT files
- **Translation**: Optional translation of transcripts to target languages
- **Storage**: Saves results to the video database
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **Extensible Design**: Modular architecture that allows for easy addition of new services

## API Endpoints

### Process Audio

```
POST /api/orchestration/process
```

Processes an audio file and its corresponding SRT file through the microservices.

**Request:**
- Form data:
  - `audio`: Audio file
  - `srt`: SRT file
  - `videoId`: ID of the video
  - `videoUrl`: URL of the video
  - `targetLanguage` (optional): Language to translate the transcript to

**Response:**
```json
{
  "videoId": "string",
  "videoUrl": "string",
  "alignmentResult": {
    "alignment": {},
    "videoId": "string",
    "videoUrl": "string",
    "savedToDb": true,
    "dbRecord": {}
  },
  "translationResult": {
    "videoId": "string",
    "language": "string",
    "translatedText": "string",
    "createdAt": "string",
    "id": "string"
  },
  "completedAt": "string",
  "status": "success"
}
```

### Retry Processing

```
POST /api/orchestration/retry/:videoId
```

Retries processing for a specific video ID.

**Request:**
```json
{
  "videoUrl": "string",
  "audioFilePath": "string",
  "srtFilePath": "string",
  "targetLanguage": "string",
  "maxRetries": 3
}
```

**Response:** Same as Process Audio endpoint

## Setup

1. Install dependencies:
```
npm install
```

2. Build the service:
```
npm run build
```

3. Start the service:
```
npm start
```

## Environment Variables

- `PORT`: Port to run the service on (default: 4000)
- `STABLE_TS_URL`: URL of the stable-ts service (default: http://localhost:5000/stable-ts)
- `TRANSLATOR_URL`: URL of the translator service (default: http://localhost:3001/api/translations)
- `VIDEO_DB_URL`: URL of the video-db service (default: http://localhost:3000/api/videos)
- `LOG_LEVEL`: Logging level (default: info)

## Development

For development with hot reloading:
```
npm run dev
```

## Architecture

The service follows a clean architecture with:
- **Models**: Data structures used throughout the application
- **Clients**: Interfaces to external services
- **Services**: Business logic and orchestration
- **Routes**: API endpoints
- **Utils**: Utility functions and helpers

## Error Handling

The service implements comprehensive error handling:
- Each service call is wrapped in try/catch blocks
- Detailed error messages are logged and returned to clients
- Retry mechanisms for transient failures
- Partial success handling when some services succeed but others fail
