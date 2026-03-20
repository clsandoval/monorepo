import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function sanitizeFilename(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
    cb(null, WORKSPACE_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, sanitizeFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadRouter = Router();

uploadRouter.post('/api/upload', upload.array('files', 20), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  res.json({
    files: files.map((f) => ({
      name: f.originalname,
      path: f.path,
      size: f.size,
    })),
  });
});
