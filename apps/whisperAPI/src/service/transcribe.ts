import fs from "fs"
import OpenAI from "openai"

const openai = new OpenAI({
	project: "proj_1fHZWbaJbDNrZ383QUiQltVw"
})

export type Word = {
	start: number
	end: number
	word?: string
}

export type TranscriptionOutPut = {
	tasks?: string
	language: string
	duration: string
	text: string
	words?: Word[]
}

export const transcribe = async (
	filePath: string
): Promise<TranscriptionOutPut> =>
	await openai.audio.transcriptions.create({
		file: fs.createReadStream(filePath),
		model: "whisper-1",
		language: "zh",
		response_format: "verbose_json",
		timestamp_granularities: ["word"]
	})
