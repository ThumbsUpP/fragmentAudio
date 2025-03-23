// Simple test script to test saving an alignment result
import fetch from 'node-fetch';

const testData = {
  videoId: "test-circular-ref-fix",
  videoUrl: "https://example.com/test-video.mp4",
  alignmentData: {
    segments: [
      {
        text: "Hello world",
        start: 0,
        end: 1,
        words: [
          { word: "Hello", start: 0, end: 0.5 },
          { word: "world", start: 0.5, end: 1 }
        ]
      }
    ]
  }
};

async function testSaveAlignment() {
  try {
    const response = await fetch('http://localhost:3001/api/alignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testSaveAlignment();
