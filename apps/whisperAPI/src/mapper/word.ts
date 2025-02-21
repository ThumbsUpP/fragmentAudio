import { Word } from "../service/transcribe"

export const mapWord = (word: Word, duration: string, i: number): Word => {
  
	return {
		...word,
		start: Math.floor(word.start * 1000),
		end: Math.floor(word.end * 1000)
	}
}
