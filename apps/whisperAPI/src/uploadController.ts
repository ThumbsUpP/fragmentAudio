import fs from "fs"
import path from "path"
import { Request, Response } from "express"
import { transcribe, Word } from "./service/transcribe"
import { extractAndProcessFiles } from "./service/extractAndProcessFiles"
import { reduceTranscriptions } from "./mapper/transcription"

interface MulterRequest extends Request {
	file: Express.Multer.File
}

export type LightTranscription = {
	text: string
	duration: number
	words?: Word[]
	index: number
}

export type ShortWord = {
	s: number
	e: number
	w?: string
}

export type ShortenTranscriptions = {
	t: string
	d: number
	ws?: ShortWord[]
	i: number
}

export type TranscriptionResponse = { 
	counter: number;
	transcriptions: ShortenTranscriptions[];
}


export const handleUpload = async (req: Request, res: Response) => {
	const r = req as MulterRequest

	if (!r.file) {
		return res.status(400).send("No file uploaded.")
	}

	const zipFilePath = r.file.path
	const tempPath = path.join(__dirname, "../temp/")

	const handler = async () => {
		const files = await fs.promises.readdir(tempPath)
		const wavFiles = files.filter((file) => file.endsWith(".wav"))
		const filePath = wavFiles.map((file) => path.join(tempPath, file))

		let transcriptions: LightTranscription[] = []
		try {
			for (const [index, file] of filePath.entries()) {
				const { words, text, duration } = await transcribe(file)
				transcriptions.push({ words, text, duration: parseFloat(duration), index })
				console.log({ words, text, duration, index })
			}
		} catch (err) {
			throw new Error(`Error while processing transcription : ${err}`)
		}

		const r: TranscriptionResponse = reduceTranscriptions(transcriptions)

		res.send(r)
		// delete everything in temp here
		await fs.promises.rm(tempPath, { recursive: true, force: true })
	}

	try {
		await extractAndProcessFiles(zipFilePath, tempPath, handler)
	} catch (err) {
		res.status(500).send(err)
		// delete everything in temp here
		await fs.promises.rm(tempPath, { recursive: true, force: true })
	}
}
