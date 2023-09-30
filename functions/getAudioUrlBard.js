const functions = require("firebase-functions");
const ffmpeg = require("ffmpeg-for-serverless");
const cors = require("cors")({origin: true}); // Enable CORS for all origins
const admin = require("firebase-admin");
const storage = admin.storage();

exports.getAudioUrlBard = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    // Access the video ID from the request body
    const videoId = request.body.videoId;

    // Extract the audio from the YouTube video
    const audioFilePath = await ffmpeg.extractAudio("https://www.youtube.com/watch?v=${videoId}");

    // Upload the audio file to Cloud Storage
    const bucket = storage.bucket();
    const audioFile = bucket.file(audioFilePath);
    await audioFile.makePublic();

    // Return the publicly accessible URL of the audio file
    const audioUrl = await audioFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    return response.status(200).json({audioUrl});
  });
});
