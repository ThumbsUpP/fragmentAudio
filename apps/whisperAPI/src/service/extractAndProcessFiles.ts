import fs from "fs"
import unzipper from "unzipper"

export const extractAndProcessFiles = async (
	zipFilePath: string,
	extractPath: string,
	handler: () => Promise<void>
) => {
	try {
		await fs.promises.mkdir(extractPath, { recursive: true })

		fs.createReadStream(zipFilePath)
			.pipe(unzipper.Extract({ path: extractPath }))
			.on("close", handler)
	} catch (err) {
		throw new Error("Error extracting zip file.")
	}
}
