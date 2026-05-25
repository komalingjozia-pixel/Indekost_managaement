import { Router } from 'express';
import { getLaporan } from '../controllers/laporanController.js';

const router = Router();

router.get('/', getLaporan);

export default router;
