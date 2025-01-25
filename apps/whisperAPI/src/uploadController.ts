import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import unzipper from 'unzipper';

interface MulterRequest extends Request {
  file: Express.Multer.File;
}


export const handleUpload = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const zipFilePath = req.file.path;
  const extractPath = path.join(__dirname, 'extracted');

  try {
    await fs.promises.mkdir(extractPath, { recursive: true });

    fs.createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .on('close', async () => {
        const files = await fs.promises.readdir(extractPath);
        res.send(`Files extracted: ${files.join(', ')}`);
      });
  } catch (err) {
    res.status(500).send('Error extracting zip file.');
  }
};
