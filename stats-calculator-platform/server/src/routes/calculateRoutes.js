import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { calculate, listTests } from '../controllers/calculateController.js';
import { TEST_IDS } from '../services/statsService.js';

const router = Router();

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, error: 'Validation failed', details: errors.array() });
  }
  next();
}

router.get('/tests', listTests);

router.post(
  '/:testId',
  param('testId').isIn([...TEST_IDS]),
  body().isObject(),
  validate,
  calculate
);

export default router;
