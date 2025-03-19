# LLM Service

A versatile microservice for various language processing tasks using external LLM models.

## Features

- Translate text to different languages using LLM models
- Correct grammar in text content
- Summarize text content
- Detect language of text content
- Analyze sentiment of text content
- Store processing results in the video-db service
- Retrieve processing results by video ID and type
- Delete processing results when no longer needed

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

### Translate Text

```
POST /api/llm/translate
```

Request body:
```json
{
  "videoId": "video123",
  "text": "This is the text to translate",
  "targetLanguage": "es"
}
```

### Correct Grammar

```
POST /api/llm/grammar
```

Request body:
```json
{
  "videoId": "video123",
  "text": "This is text with grammar mistakes"
}
```

### Summarize Text

```
POST /api/llm/summarize
```

Request body:
```json
{
  "videoId": "video123",
  "text": "Long text to summarize...",
  "maxLength": 200
}
```

### Detect Language

```
POST /api/llm/detect
```

Request body:
```json
{
  "videoId": "video123",
  "text": "Text to detect language"
}
```

### Analyze Sentiment

```
POST /api/llm/sentiment
```

Request body:
```json
{
  "videoId": "video123",
  "text": "Text to analyze sentiment"
}
```

### Get Processing Results for a Video

```
GET /api/llm/:videoId
```

Optional query parameters:
- `type`: Filter by processing type (translate, grammar, summarize, detect, sentiment)
- `language`: Filter translations by language (only for translation type)

### Delete Processing Result

```
DELETE /api/llm/:videoId
```

Required query parameters:
- `type`: Processing type to delete (translate, grammar, summarize, detect, sentiment)
- `language`: The language of the translation to delete (only required for translation type)

## Environment Variables

- `PORT`: Port for the service (default: 3001)
- `LLM_API_KEY`: API key for the LLM service
- `LLM_API_URL`: URL of the LLM API
- `LLM_MODEL`: LLM model to use for language processing tasks
- `LLM_TEMPERATURE`: Temperature setting for LLM responses (default: 0.3)
- `LLM_MAX_TOKENS`: Maximum tokens for LLM responses (default: 4000)

## Integration with Existing Services

This service integrates with:

1. **video-db**: Stores and retrieves language processing results
2. **stable-ts**: Can be called from stable-ts for various language processing tasks after alignment

## Example Usage

After aligning audio with SRT in the stable-ts service, you can call this service for various language processing tasks:

```javascript
// Example code to call the translation service
const response = await fetch('http://localhost:3001/api/llm/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    videoId: 'video123',
    text: alignmentResult.transcript,
    targetLanguage: 'es'
  })
});

const translationResult = await response.json();

// Example code to call the grammar correction service
const grammarResponse = await fetch('http://localhost:3001/api/llm/grammar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    videoId: 'video123',
    text: alignmentResult.transcript
  })
});

const grammarResult = await grammarResponse.json();
```
