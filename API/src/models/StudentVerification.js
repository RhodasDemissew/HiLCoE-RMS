import mongoose from 'mongoose';

const studentVerificationSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    program: { type: String, trim: true, default: '' },
    verified_at: { type: Date, default: null },
    verified_email: { type: String, trim: true, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'student_verifications' }
);

studentVerificationSchema.index({ student_id: 1 });

export const StudentVerification = mongoose.models.StudentVerification || mongoose.model('StudentVerification', studentVerificationSchema, 'student_verifications');
