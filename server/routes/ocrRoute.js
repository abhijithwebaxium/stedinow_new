import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import { processDocument } from '../controllers/ocrController.js';

const router = express.Router();

// Ensure temp directory exists
const tempDir = 'temp/';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Local storage configuration for OCR temp files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `ocr-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadLocal = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for OCR images
});

// Protected route - only logged in users can use OCR
router.use(requireAuth);

router.post('/process', uploadLocal.single('document'), processDocument);

export default router;
