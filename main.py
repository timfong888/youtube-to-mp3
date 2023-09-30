import os
from pytube import YouTube
from google.cloud import storage

# Define your Google Cloud Storage bucket name and the folder where you want to store the audio files
BUCKET_NAME = "youtube-audio-mp3"
AUDIO_FOLDER = ""

def download_audio_youtube(youtube_video_id):
    try:
        # Create a YouTube object
        yt = YouTube(f"https://www.youtube.com/watch?v={youtube_video_id}")

        # Get the audio stream with the highest quality
        audio_stream = yt.streams.filter(only_audio=True, file_extension='mp4').first()

        # Download the audio stream
        audio_stream.download(output_path=AUDIO_FOLDER, filename=youtube_video_id)

        # Initialize the Google Cloud Storage client
        storage_client = storage.Client()

        # Get the bucket where you want to store the audio files
        bucket = storage_client.bucket(BUCKET_NAME)

        # Define the destination path in Google Cloud Storage
        destination_blob_name = f"{AUDIO_FOLDER}{youtube_video_id}.mp3"

        # Upload the audio file to Google Cloud Storage
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(os.path.join(AUDIO_FOLDER, f"{youtube_video_id}.mp4"))

        # Set the public URL for the uploaded audio file
        public_url = f"https://storage.googleapis.com/{BUCKET_NAME}/{destination_blob_name}"

        return public_url

    except Exception as e:
        return str(e)

def youtube_to_mp3(request):
    # Get the YouTube Video ID from the request
    request_json = request.get_json()
    if 'video_id' in request_json:
        youtube_video_id = request_json['video_id']
        public_url = download_audio_youtube(youtube_video_id)
        return {"public_url": public_url}
    else:
        return {"error": "Invalid request. Please provide a 'video_id' parameter."}

