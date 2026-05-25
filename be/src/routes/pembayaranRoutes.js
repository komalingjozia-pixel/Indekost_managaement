import { Router } from 'express';
import {
  addCicilan,
  create,
  getAll,
  getDetail,
  remove,
} from '../controllers/pembayaranController.js';

const router = Router();

router.get('/', getAll);
router.post('/', create);
router.get('/:id/detail', getDetail);
router.post('/:id/cicilan', addCicilan);
router.delete('/:id', remove);

export default router;
