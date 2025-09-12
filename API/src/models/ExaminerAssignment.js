import mongoose from 'mongoose';

const examinerAssignmentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    examiner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigned_at: { type: Date, default: Date.now },
    due_at: { type: Date },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'examiner_assignments' }
);

examinerAssignmentSchema.index({ project: 1, examiner: 1 }, { unique: true });

export const ExaminerAssignment = mongoose.models.ExaminerAssignment || mongoose.model('ExaminerAssignment', examinerAssignmentSchema, 'examiner_assignments');
