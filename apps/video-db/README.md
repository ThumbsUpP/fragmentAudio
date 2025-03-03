# Video Database Service

A TypeScript-based database service for storing and retrieving video data with associated JSON content.

## Features

- Store video data with videoId, videoUrl, and JSON content
- RESTful API for CRUD operations
- Supports both SQLite (development) and PostgreSQL (production)
- TypeORM for database management

## API Endpoints

- `GET /api/videos` - Get all video data entries
- `GET /api/videos/:videoId` - Get video data by videoId
- `POST /api/videos` - Create or update video data
- `DELETE /api/videos/:videoId` - Delete video data by videoId

## Setup

### Development

1. Install dependencies:
   ```
   npm install
   ```

2. Run in development mode:
   ```
   npm run dev
   ```

### Production

1. Build the project:
   ```
   npm run build
   ```

2. Set the `DATABASE_URL` environment variable to your PostgreSQL connection string:
   ```
   export DATABASE_URL=postgres://username:password@hostname:port/database
   ```

3. Start the server:
   ```
   npm start
   ```

## Example Usage

### Storing Video Data

```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "video123",
    "videoUrl": "https://example.com/videos/video123.mp4",
    "jsonData": {
      "title": "Sample Video",
      "duration": 120,
      "transcription": {
        "segments": [
          {"start": 0, "end": 10, "text": "Hello world"},
          {"start": 11, "end": 20, "text": "This is a sample video"}
        ]
      }
    }
  }'
```

### Retrieving Video Data

```bash
curl http://localhost:3000/api/videos/video123
```
