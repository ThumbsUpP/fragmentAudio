import { Word } from "../service/transcribe"
import { LightTranscription } from "../uploadController"

export const mapWord = (word: Word): Word => {
	return {
		...word,
		start: Math.floor(word.start * 1000),
		end: Math.floor(word.end * 1000)
	}
}

export const reduceTranscriptions = (transcriptions: LightTranscription[]): any =>
	transcriptions.reduce(
		(acc, transcription, index) => {
			if (!transcription || !transcription.words) return acc

			const duration = Math.floor(parseFloat(transcription.duration) * 1000)

			if (isNaN(duration)) return acc

			if (index !== 0) {
				acc.counter = acc.counter + duration
			}

			const mappedWords = transcription.words.map(mapWord).map((word) => {
				return {
					start: word.start + acc.counter,
					end: word.end + acc.counter,
					word: word.word
				}
			})

			return {
				counter: acc.counter + duration,
				transcriptions: acc.transcriptions.concat({
					text: transcription.text,
					duration: transcription.duration,
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
