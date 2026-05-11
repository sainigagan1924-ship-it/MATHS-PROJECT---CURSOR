import crypto from 'crypto';
import mongoose from 'mongoose';
import { SavedCalculation } from '../models/SavedCalculation.js';

function requireDb(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ ok: false, error: 'Database unavailable' });
    return false;
  }
  return true;
}

export async function listSaved(req, res, next) {
  try {
    if (!requireDb(res)) return;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const items = await SavedCalculation.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ ok: true, items });
  } catch (e) {
    next(e);
  }
}

export async function createSaved(req, res, next) {
  try {
    if (!requireDb(res)) return;
    const { testId, testLabel, inputs, resultSnapshot, summary, generateShare } = req.body;
    if (!testId || !testLabel || !inputs) {
      res.status(400).json({ ok: false, error: 'testId, testLabel, and inputs are required' });
      return;
    }
    const shareToken = generateShare ? crypto.randomBytes(12).toString('hex') : undefined;
    const doc = await SavedCalculation.create({
      testId,
      testLabel,
      inputs,
      summary: summary || '',
      resultSnapshot: resultSnapshot || null,
      shareToken,
    });
    res.status(201).json({ ok: true, item: doc });
  } catch (e) {
    next(e);
  }
}

export async function deleteSaved(req, res, next) {
  try {
    if (!requireDb(res)) return;
    const { id } = req.params;
    await SavedCalculation.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function getByShareToken(req, res, next) {
  try {
    if (!requireDb(res)) return;
    const { token } = req.params;
    const item = await SavedCalculation.findOne({ shareToken: token }).lean();
    if (!item) {
      res.status(404).json({ ok: false, error: 'Not found' });
      return;
    }
    res.json({ ok: true, item });
  } catch (e) {
    next(e);
  }
}
