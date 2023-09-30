// source: Perplexity
// filename: ffmpegYTvideo-perplexity.js
// package.json main: ffmpegYTvideo-perplexity.js
// firebase deploy --only functions:getAudioUrlPerp 

// version 2: requested the removal of estlint issues and to fix
//  the two declarations of ffmpeg

// version 3: lots of formatting and had to keep repeating myself

// version 4: added fs

const functions = require("firebase-functions");
const ytdl = require("ytdl-core");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors")({origin: true});
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

exports.getAudioUrlPerp = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const videoId = request.body.videoId;
    console.log("Received videoId:", videoId);

    if (!videoId) {
      return response.status(400).
          json({error: "Invalid request, unable to process"});
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      // const info = await ytdl.getInfo(url);
      const audioUrl = await new Promise((resolve, reject) => {
        const audioStream = ffmpeg(ytdl(url))
            .noVideo()
            .format("mp3")
            .audioBitrate(128)
            .on("end", () => {
              resolve(audioStream.pipe(fs.createReadStream(audioStream.path)));
            })
            .on("error", (error) => {
              reject(error);
            })
            .saveToFile();
      });
      return response.status(200).json({audioUrl});
    } catch (error) {
      console.error(error);
      return response.status(500).json({error: "Internal server error."});
    }
  });
});
