import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import unzipper from 'unzipper';
import OpenAI from 'openai';

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEYS,
});

export const handleUpload = async (req: Request, res: Response) => {
  const r = req as MulterRequest;

  if (!r.file) {
    return res.status(400).send('No file uploaded.');
  }

  const zipFilePath = r.file.path;
  const extractPath = path.join(__dirname, '../temp/');

  try {
    await fs.promises.mkdir(extractPath, { recursive: true });

    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .on('close', async () => {
        const files = await fs.promises.readdir(extractPath);
        const wavFiles = files.filter(file => file.endsWith('.wav'));

        const transcriptions = await Promise.all(wavFiles.map(async (file, i) => {
          if (i !== 0) return
          const filePath = path.join(extractPath, file);
          console.log({filePath})
          const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1',
            language: 'zh',
            response_format: 'verbose_json',
            timestamp_granularities: ['word']
          });
          return { file, transcription: transcription.words };
        }));

        res.send(transcriptions);
        // delete everything in temp here
        await fs.promises.rm(extractPath, { recursive: true, force: true });
      });

  } catch (err) {
    res.status(500).send('Error extracting zip file.');
    // delete everything in temp here
    await fs.promises.rm(extractPath, { recursive: true, force: true });
  }
};
