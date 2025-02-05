import fs from "fs"
import OpenAI from "openai"

const openai = new OpenAI({
	// apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is correctly set
	// organization: "org-86EqRxdJbJg4Md8hxB5bBPzQ",
	project: "proj_1fHZWbaJbDNrZ383QUiQltVw"
})

type Word = {
	start: number
	end: number
	value: string
}

export type Transcription = {
	tasks: string
	language: string
	duration: number
	text: string
	words: Word[]
}

export const transcribe = async (
	filePath: string
): Promise<OpenAI.Audio.Transcriptions.TranscriptionVerbose> =>
	await openai.audio.transcriptions.create({
		file: fs.createReadStream(filePath),
		model: "whisper-1",
		language: "zh",
		response_format: "verbose_json",
		timestamp_granularities: ["word"]
	})
