import { Router } from 'express';
import { body, query } from 'express-validator';
import { validationResult } from 'express-validator';
import {
  listSaved,
  createSaved,
  deleteSaved,
  getByShareToken,
} from '../controllers/savedController.js';

const router = Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

router.get('/', query('limit').optional().isInt({ min: 1, max: 100 }), validate, listSaved);

router.post(
  '/',
  body('testId').isString().notEmpty(),
  body('testLabel').isString().notEmpty(),
  body('inputs').isObject(),
  body('resultSnapshot').optional(),
  body('summary').optional().isString(),
  body('generateShare').optional().isBoolean(),
  validate,
  createSaved
);

router.delete('/:id', deleteSaved);

router.get('/share/:token', getByShareToken);

export default router;
