import fs from 'fs';
import { Request, Response } from 'express';
import { MulterRequest } from './interfaces';
import { srtParserMapper } from './mapper/srt-map';

export const srtToJsonController = async (req: Request, res: Response) => {
  const r = req as MulterRequest

  if (r.file === undefined ){
    return res.status(400).json({ error: 'No file uploaded' });
  }
    const filePath = r.file.path; // Assuming the file is uploaded and available at req.file.path
  
    const { default: SrtParser } = await import('srt-parser-2');
    const parser = new SrtParser();

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read the file' });
        }
        try {
            const json = parser.fromSrt(data);

            const result = srtParserMapper(json)
            res.json(result || []);
        } catch (parseError) {
            res.status(500).json({ error: 'Failed to parse the SRT file' });
        }
    });
};
