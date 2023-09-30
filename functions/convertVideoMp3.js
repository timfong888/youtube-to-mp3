const functions = require("firebase-functions");
const ytdl = require("ytdl-core");
const ffmpeg = require("ffmpeg-for-serverless");
const cors = require("cors")({origin: true}); // Enable CORS for all origins


exports.getAudioUrl = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    // Access the video ID from the request body
    const videoId = request.body.videoId;
    // Log the videoId using console.log
    console.log("Received videoId:", videoId);
    console.log("Request body:", request.body);

    if (!videoId) {
      return response.status(400)
          .json({error: "Invalid request, unable to process"});
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log("videourl:", videoUrl);

    // this was added when I asked about ffmpeg
    const audioFilePath = await ffmpeg.extractAudio(videoUrl);
    console.log("audioFilePath", audioFilePath);

    const info = await ytdl.getInfo(videoUrl);
    console.log("getInfo Formats", info.formats);

    // Get video info
    ytdl.getInfo(videoUrl, (error, info) => {
      if (error) {
        console.error("Error fetching video info:", error);
        return;
      }

      // Print available formats
      console.log("Available formats:");
      info.formats.forEach((format, index) => {
        console.log(`Format ${index + 1}:`);
        console.log(`Quality: ${format.quality}`);
        console.log(`Container: ${format.container}`);
        console.log(`Video Codec: ${format.codec}`);
        console.log("-------------------");
      });
    });

    try {
      //  this ytdl.getInfo seem like a duplicate
      //  const info = await ytdl.getInfo(videoUrl);
      // commenting this out because the formats doesn't seem to work
      //  const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      //  const audioUrl = audioFormats.find((format) =>
      //  format.container === "mp3").url;

      return response.status(200).json({audioFilePath});
    } catch (error) {
      // Log the error message using console.log
      console.log("Error:", error);
      return response.status(500).json({error: "Internal server error",
        errorMessage: error.message});
    }
  });
});
