import express from 'express';
import multer from 'multer';
import { handleUpload } from './uploadController';

const app = express();
const port = process.env.WHISPER_PORT || 3001;

const upload = multer({ dest: 'uploads/' });

app.get('/', (_, res) => {
  res.send('Hello, world!');
});

app.post('/upload', upload.single('zipfile'), handleUpload);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
