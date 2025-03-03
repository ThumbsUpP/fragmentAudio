import { VideoDbClient } from "../client/VideoDbClient";

/**
 * Example script demonstrating how to use the VideoDbClient
 */
async function main() {
    // Create a client instance
    const client = new VideoDbClient();
    
    try {
        // Example data
        const videoId = "example-video-123";
        const videoUrl = "https://example.com/videos/example-video-123.mp4";
        const jsonData = {
            title: "Example Video",
            duration: 180,
            transcription: {
                segments: [
                    { start: 0, end: 10, text: "Hello, this is an example video." },
                    { start: 11, end: 20, text: "Demonstrating how to use the VideoDbClient." }
                ]
            }
        };
        
        console.log("Saving video data...");
        const savedData = await client.saveVideoData(videoId, videoUrl, jsonData);
        console.log("Saved video data:", savedData);
        
        console.log("\nRetrieving video data...");
        const retrievedData = await client.getVideoDataById(videoId);
        console.log("Retrieved video data:", retrievedData);
        
        console.log("\nDeleting video data...");
        const deleted = await client.deleteVideoData(videoId);
        console.log(`Video data deleted: ${deleted}`);
        
        console.log("\nVerifying deletion...");
        const checkData = await client.getVideoDataById(videoId);
        console.log(`Video data exists: ${checkData !== null}`);
        
    } catch (error) {
        console.error("Error in example:", error);
    }
}

// Run the example
// Note: This will only work if the video-db service is running
console.log("This example demonstrates how to use the VideoDbClient.");
console.log("Make sure the video-db service is running before executing this script.");
console.log("To run the service: npm run dev\n");

// Uncomment the line below to run the example
// main();
