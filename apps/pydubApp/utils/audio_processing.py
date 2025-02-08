from pydub import AudioSegment, silence
import io
from typing import List, Tuple, Dict

# Ensure ffmpeg is set as the audio backend
AudioSegment.converter = "ffmpeg"

def process_audio(file: str) -> Tuple[List[bytes], List[Dict[str, int]]]:
    try:
        audio = AudioSegment.from_file(file)
    except Exception as e:
        raise ValueError(f"Decoding failed: {str(e)}")
    
    # Detect non-silent chunks
    nonsilent_ranges = silence.detect_nonsilent(audio, min_silence_len=500, silence_thresh=-40)
    
    # Adjust the start time of each chunk to the end time of the previous chunk
    output_ranges = []
    for i, (start, end) in enumerate(nonsilent_ranges):
        tuple_range = (start, end)
        if i == 0:
            tuple_range = (0, end)
        else:
            tuple_range = (nonsilent_ranges[i-1][1], end)
        output_ranges.append(tuple_range)
    
    # Ensure chunks are within the desired length constraints
    min_length = 5000  # 5 seconds in milliseconds
    max_length = 30000  # 30 seconds in milliseconds
    constrained_ranges = []
    i = 0
    while i < len(output_ranges):
        start, end = output_ranges[i]
        while end - start < min_length and i < len(output_ranges) - 1:
            next_start, next_end = output_ranges[i + 1]
            if next_end - start <= max_length:
                end = next_end
                i += 1
            else:
                break
        constrained_ranges.append((start, end))
        i += 1
    
    # Convert audio chunks to .wav files and collect timestamps
    wav_chunks: List[bytes] = []
    timestamps: List[Dict[str, int]] = []
    for i, (start, end) in enumerate(constrained_ranges):
        chunk = audio[start:end]
        wav_io = io.BytesIO()
        chunk.export(wav_io, format="wav")
        wav_chunks.append(wav_io.getvalue())
        timestamps.append({'start': start, 'end': end, 'index': i})
        # Print the length of each chunk in seconds
        print(f"Chunk {i}: Length = {(end - start) / 1000} seconds")

    return wav_chunks, timestamps
