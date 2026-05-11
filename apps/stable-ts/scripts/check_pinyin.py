import json
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from align import align_audio_with_srt


def main():
    if len(sys.argv) != 3:
        print("Usage: python scripts/check_pinyin.py <audio_path> <srt_path>")
        return

    audio_path = sys.argv[1]
    srt_path = sys.argv[2]

    print(f"Aligning audio {audio_path} with SRT {srt_path}...")
    result = align_audio_with_srt(audio_path, srt_path)

    # Pretty print the first segment to check pinyin
    if result and len(result) > 0:
        print("\nFirst segment:")
        print(f"Text: {result[0]['text']}")
        print("\nWords with pinyin:")
        for word in result[0]["words"][:5]:
            print(f"Word: {word['word']}, Pinyin: {word['pinyin']}, Time: {word['start']:.2f}-{word['end']:.2f}")

    # Save the full result to a JSON file
    output_file = "aligned_with_pinyin.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nFull result saved to {output_file}")


if __name__ == "__main__":
    main()
