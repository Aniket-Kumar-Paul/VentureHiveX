import { Router } from 'express';
import multer from 'multer';
import { uploadFile, uploadMetadata } from '../controllers/ipfsController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Temp folder for multer

// IPFS uploads should be restricted to authenticated users
router.post('/upload', authenticateToken, upload.single('file'), uploadFile);
router.post('/metadata', authenticateToken, uploadMetadata);

export default router;
