import { runCalculation, TEST_IDS } from '../services/statsService.js';

export function calculate(req, res, next) {
  try {
    const { testId } = req.params;
    if (!TEST_IDS.has(testId)) {
      const err = new Error('Invalid test id');
      err.status = 400;
      throw err;
    }
    const payload = runCalculation(testId, req.body || {});
    res.json(payload);
  } catch (e) {
    next(e);
  }
}

export function listTests(req, res) {
  res.json({
    ok: true,
    tests: Array.from(TEST_IDS).map((id) => ({ id, path: `/test/${id}` })),
  });
}
