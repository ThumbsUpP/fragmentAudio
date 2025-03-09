import stable_whisper
import torchaudio
import pysrt
import json
import torch
import uuid

def align_audio_with_srt(audio_path, srt_path):
    """
    Align a Chinese audio file with an SRT file at the word level using stable-ts,
    and return word-level timestamps as JSON.

    Args:
        audio_path (str): Path to the Chinese audio file (e.g., .mp3, .wav).
        srt_path (str): Path to the SRT subtitle file.

    Returns:
        list: List of word-level timestamps.
    """
    # Load the Whisper model from stable-ts, optimized for CPU
    model = stable_whisper.load_model('base', device='cpu')

    # Load the audio file and convert to mono
    waveform, sample_rate = torchaudio.load(audio_path)
    
    if sample_rate != 16000:
        waveform = torchaudio.transforms.Resample(sample_rate, 16000)(waveform)
        sample_rate = 16000
        
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0)  # Average channels if stereo
    else:   
        waveform = waveform[0]  # Take single channel if mono

    # Parse the SRT file
    subs = pysrt.open(srt_path, encoding='utf-8')

    # Initialize list to store all word timestamps
    
    output = []
    
    print(f"Loaded {len(subs)} subtitle segments from {srt_path}: {subs[0]}")

    # Process each subtitle segment
    for sub in subs:
        # Convert SRT timestamps to seconds
        start_time = sub.start.ordinal / 1000.0
        end_time = sub.end.ordinal / 1000.0

        # Compute sample indices for the audio chunk
        start_sample = int(start_time * sample_rate)
        end_sample = int(end_time * sample_rate)

        # Skip if segment exceeds audio length
        print('start_sample : ',start_sample)
        print('end_sample : ',end_sample)
        print('waveform.shape[0] : ',waveform.shape[0])

        if start_sample >= waveform.shape[0] or end_sample > waveform.shape[0]:
            print(f"Warning: Segment {sub.index} out of audio bounds, skipping.")
            continue

        # Extract the audio chunk
        chunk = waveform[start_sample:end_sample]

        # Get the transcript text for this segment
        text = sub.text

        # Align the audio chunk with the text using stable-ts
        result = model.align(chunk, text, language='zh')
        
        # Generate a unique UUID for this segment
        segment_id = str(uuid.uuid4())
        
        segment_words = {"id": segment_id, "text": text, "start": start_time, "end": end_time, "words": []}
        all_words = []  
        # Use aligned segments directly from the result
        if hasattr(result, 'all_words'):
            for wt in result.all_words():
                all_words.append({
                    "word": getattr(wt, "word", ""),
                    "start": wt.start + start_time,
                    "end": wt.end + start_time
                })
        else:
            print(f"Warning: No 'all_words' attribute in result for segment {sub.index}")
        
        segment_words["words"] = all_words
        output.append(segment_words)
        

    return output

if __name__ == "__main__":
    # Example usage: replace with your file paths
    audio_file = "chinese_audio.mp3"
    srt_file = "chinese_subtitles.srt"
    output_json = align_audio_with_srt(audio_file, srt_file)
    with open('aligned_output.json', 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)
    print(f"Alignment completed. Results saved to aligned_output.json")
