import stable_whisper
import torchaudio
import pysrt
import jieba
import json
import torch

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
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0)  # Average channels if stereo
    else:
        waveform = waveform[0]  # Take single channel if mono

    # Parse the SRT file
    subs = pysrt.open(srt_path, encoding='utf-8')

    # Initialize list to store all word timestamps
    all_words = []

    # Process each subtitle segment
    for sub in subs:
        # Convert SRT timestamps to seconds
        start_time = sub.start.ordinal / 1000.0
        end_time = sub.end.ordinal / 1000.0

        # Compute sample indices for the audio chunk
        start_sample = int(start_time * sample_rate)
        end_sample = int(end_time * sample_rate)

        # Skip if segment exceeds audio length
        if start_sample >= waveform.shape[0] or end_sample > waveform.shape[0]:
            print(f"Warning: Segment {sub.index} out of audio bounds, skipping.")
            continue

        # Extract the audio chunk
        chunk = waveform[start_sample:end_sample]

        # Get the transcript text for this segment
        text = sub.text

        # Align the audio chunk with the text using stable-ts
        result = model.align(chunk, text, language='zh')
        
        print(result.to_srt_vtt())

        # Extract character-level timestamps from alignment
        if hasattr(result, 'all_words'):
            char_timestamps = [(wt.start, wt.end) for wt in result.all_words()]
            print(char_timestamps)
        else:
            print(f"Warning: No 'all_words' attribute in result for segment {sub.index}")
            continue

        # Debugging: Print character timestamps and words
        print(f"Character timestamps for segment {sub.index}: {char_timestamps}")
        print(f"Words for segment {sub.index}: {list(jieba.cut(text))}")

        # Segment the text into words using jieba
        words = list(jieba.cut(text))

        # Map character timestamps to word timestamps
        char_idx = 0
        for word in words:
            word_len = len(word)
            # Check if word exceeds available character timestamps
            if char_idx + word_len > len(char_timestamps):
                print(f"Warning: Word '{word}' exceeds character timestamps in segment {sub.index}")
                continue
            # Calculate word start and end times, adjusting for segment start
            word_start = char_timestamps[char_idx][0] + start_time
            word_end = char_timestamps[char_idx + word_len - 1][1] + start_time
            all_words.append({"word": word, "start": word_start, "end": word_end})
            char_idx += word_len

    return all_words

if __name__ == "__main__":
    # Example usage: replace with your file paths
    audio_file = "chinese_audio.mp3"
    srt_file = "chinese_subtitles.srt"
    output_json = align_audio_with_srt(audio_file, srt_file)
    with open('aligned_output.json', 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)
    print(f"Alignment completed. Results saved to aligned_output.json")
