import { Word } from "../service/transcribe"
import { LightTranscription, ShortenTranscriptions, TranscriptionResponse } from "../uploadController"

export const mapWord = (word: Word): Word => {
	return {
		...word,
		start: word.start * 1000,
		end: word.end * 1000
	}
}

export const reduceTranscriptions = (
	transcriptions: LightTranscription[]
): TranscriptionResponse =>
	transcriptions.reduce(
		(acc, transcription, index) => {
			if (!transcription || !transcription.words) return acc

			const duration = transcription.duration * 1000

			if (isNaN(duration)) return acc

			const mappedWords = transcription.words.map(mapWord).map((word) => {
				return {
					s: Math.floor(word.start + acc.counter),
					e: Math.floor(word.end + acc.counter),
					w: word.word
				}
			})

			return {
				counter: acc.counter + duration,
				transcriptions: acc.transcriptions.concat({
					t: transcription.text,
					d: Math.floor(duration),
					ws: mappedWords,
					i: index
				})
			}
		},
		{
			counter: 0,
			transcriptions: [] as ShortenTranscriptions[]
		}
	)
