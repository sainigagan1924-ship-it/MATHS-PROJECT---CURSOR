import mongoose from 'mongoose';

const savedCalculationSchema = new mongoose.Schema(
  {
    testId: { type: String, required: true, index: true },
    testLabel: { type: String, required: true },
    inputs: { type: mongoose.Schema.Types.Mixed, required: true },
    summary: { type: String },
    resultSnapshot: { type: mongoose.Schema.Types.Mixed },
    shareToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const SavedCalculation = mongoose.model('SavedCalculation', savedCalculationSchema);
