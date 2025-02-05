import fs from "fs"
import path from "path"
import { Request, Response } from "express"
import unzipper from "unzipper"
import { transcribe } from "./service/transcribe"

interface MulterRequest extends Request {
	file: Express.Multer.File
}

export const handleUpload = async (req: Request, res: Response) => {
	const r = req as MulterRequest

	if (!r.file) {
		return res.status(400).send("No file uploaded.")
	}

	const zipFilePath = r.file.path
	const extractPath = path.join(__dirname, "../temp/")

	try {
		await fs.promises.mkdir(extractPath, { recursive: true })

		fs.createReadStream(zipFilePath)
			.pipe(unzipper.Extract({ path: extractPath }))
			.on("close", async () => {
				const files = await fs.promises.readdir(extractPath)
				const wavFiles = files.filter((file) => file.endsWith(".wav"))
				const filePath = path.join(extractPath, wavFiles[0])

				let transcription: unknown
				try {
					transcription = await transcribe(filePath)
				} catch (err) {
					console.error("API call to OpenAI failed", err) // Log the error for more details
					return res.status(500).send("Error processing transcription.")
				}

				res.send(transcription)
				// delete everything in temp here
				await fs.promises.rm(extractPath, { recursive: true, force: true })
			})
	} catch (err) {
		res.status(500).send("Error extracting zip file.")
		// delete everything in temp here
		await fs.promises.rm(extractPath, { recursive: true, force: true })
	}
}
