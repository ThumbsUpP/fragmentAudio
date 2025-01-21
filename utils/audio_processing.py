import torch
import torchaudio
from pydub import AudioSegment, silence
from pydub.utils import mediainfo
import io

# Ensure ffmpeg is set as the audio backend
AudioSegment.converter = "ffmpeg"

def process_audio(file):
    try:
        audio = AudioSegment.from_file(file)
    except Exception as e:
        raise ValueError(f"Decoding failed: {str(e)}")
    
    # Detect non-silent chunks
    nonsilent_ranges = silence.detect_nonsilent(audio, min_silence_len=750, silence_thresh=-40)
    
    # Adjust the end time of each chunk to the start time of the next chunk
    for i in range(len(nonsilent_ranges) - 1):
        nonsilent_ranges[i][1] = nonsilent_ranges[i + 1][0]
    
    # Split audio based on adjusted non-silent ranges
    audio_chunks = [audio[start:end] for start, end in nonsilent_ranges]
    
    # Convert audio chunks to .wav files and collect timestamps
    wav_chunks = []
    timestamps = []
    for i, (start, end) in enumerate(nonsilent_ranges):
        chunk = audio[start:end]
        wav_io = io.BytesIO()
        chunk.export(wav_io, format="wav")
        wav_chunks.append(wav_io.getvalue())
        timestamps.append({'start': start, 'end': end, 'index': i})
        # Print the length of each chunk in seconds
        print(f"Chunk {i}: Length = {(end - start) / 1000} seconds")
    
    # Ensure the last chunk ends at the original end time
    if len(nonsilent_ranges) > 0:
        last_start, last_end = nonsilent_ranges[-1]
        last_chunk = audio[last_start:]
        wav_io = io.BytesIO()
        last_chunk.export(wav_io, format="wav")
        wav_chunks[-1] = wav_io.getvalue()
        timestamps[-1]['end'] = len(audio)
        # Print the length of the last chunk in seconds
        print(f"Chunk {len(nonsilent_ranges) - 1}: Length = {(len(audio) - last_start) / 1000} seconds")
    
    return wav_chunks, timestamps
