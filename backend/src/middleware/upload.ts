import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // default 10 MB
const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const pdfFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const uploadPdf = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: MAX_SIZE },
}).single('file');

// Promisify for cleaner async/await in controllers
export function handleUpload(req: Request, res: import('express').Response): Promise<void> {
  return new Promise((resolve, reject) => {
    uploadPdf(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
