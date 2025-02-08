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
    nonsilent_ranges = silence.detect_nonsilent(audio, min_silence_len=750, silence_thresh=-40)
    
    # Adjust the start time of each chunk to the end time of the previous chunk
    output_ranges = []
    for i, (start, end) in enumerate(nonsilent_ranges):
        tuple_range = (start, end)
        if i == 0:
            tuple_range = (0, end)
        else:
            tuple_range = (nonsilent_ranges[i-1][1], end)
        output_ranges.append(tuple_range)
    
    # Convert audio chunks to .wav files and collect timestamps
    wav_chunks: List[bytes] = []
    timestamps: List[Dict[str, int]] = []
    for i, (start, end) in enumerate(output_ranges):
        chunk = audio[start:end]
        wav_io = io.BytesIO()
        chunk.export(wav_io, format="wav")
        wav_chunks.append(wav_io.getvalue())
        timestamps.append({'start': start, 'end': end, 'index': i})
        # Print the length of each chunk in seconds
        print(f"Chunk {i}: Length = {(end - start) / 1000} seconds")

    return wav_chunks, timestamps
