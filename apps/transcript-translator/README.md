# Transcript Translator Service

A microservice for translating video transcripts using external LLM models.

## Features

- Translate transcripts to different languages using LLM models
- Store translations in the video-db service
- Retrieve translations by video ID and language
- Delete translations when no longer needed

## Setup

1. Install dependencies:
   ```
   pnpm install
   ```

2. Create a `.env` file based on `.env.example` and add your LLM API key:
   ```
   cp .env.example .env
   ```

3. Build the application:
   ```
   pnpm build
   ```

4. Start the service:
   ```
   pnpm start
   ```

## API Endpoints

### Translate a Transcript

```
POST /api/translations
```

Request body:
```json
{
  "videoId": "video123",
  "transcript": "This is the text to translate",
  "targetLanguage": "es"
}
```

### Get Translations for a Video

```
GET /api/translations/:videoId
```

Optional query parameter:
- `language`: Filter translations by language

### Delete a Translation

```
DELETE /api/translations/:videoId?language=es
```

Required query parameter:
- `language`: The language of the translation to delete

## Environment Variables

- `PORT`: Port for the service (default: 3001)
- `VIDEO_DB_URL`: URL of the video-db service
- `LLM_API_KEY`: API key for the LLM service
- `LLM_API_URL`: URL of the LLM API
- `LLM_MODEL`: LLM model to use for translations

## Integration with Existing Services

This service integrates with:

1. **video-db**: Stores and retrieves translations
2. **stable-ts**: Can be called from stable-ts to translate transcripts after alignment

## Example Usage

After aligning audio with SRT in the stable-ts service, you can call this service to translate the transcript:

```javascript
// Example code to call the translation service
const response = await fetch('http://localhost:3001/api/translations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    videoId: 'video123',
    transcript: alignmentResult.transcript,
    targetLanguage: 'es'
  })
});

const translationResult = await response.json();
```
