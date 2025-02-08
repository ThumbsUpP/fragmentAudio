import { Word } from "../service/transcribe"
import { LightTranscription } from "../uploadController"

export const mapWord = (word: Word): Word => {
	return {
		...word,
		start: word.start * 1000,
		end: word.end * 1000
	}
}

export const reduceTranscriptions = (
	transcriptions: LightTranscription[]
): any =>
	transcriptions.reduce(
		(acc, transcription, index) => {
			if (!transcription || !transcription.words) return acc

			const duration = transcription.duration * 1000

			if (isNaN(duration)) return acc

			const mappedWords = transcription.words.map(mapWord).map((word) => {
				return {
					start: Math.floor(word.start + acc.counter),
					end: Math.floor(word.end + acc.counter),
					word: word.word
				}
			})

			return {
				counter: acc.counter + duration,
				transcriptions: acc.transcriptions.concat({
					text: transcription.text,
					duration: Math.floor(duration),
					words: mappedWords,
					index
				})
			}
		},
		{
			counter: 0,
			transcriptions: [] as LightTranscription[]
		}
	)
