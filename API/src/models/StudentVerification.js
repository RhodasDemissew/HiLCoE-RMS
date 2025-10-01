import mongoose from 'mongoose';

const studentVerificationSchema = new mongoose.Schema(
  {
    student_id: { type: String, required: true, unique: true, trim: true },
    first_name: { type: String, required: true, trim: true },
    middle_name: { type: String, trim: true, default: '' },
    last_name: { type: String, required: true, trim: true },
    program: { type: String, trim: true, default: '' },
    assigned_supervisor: {
      supervisor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      supervisor_name: { type: String, trim: true, default: '' },
      supervisor_email: { type: String, trim: true, default: '' },
    },
    verified_at: { type: Date, default: null },
    verified_email: { type: String, trim: true, default: null },
    signup_token: { type: String, default: null },
    signup_token_expires_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'student_verifications' }
);

export const StudentVerification = mongoose.models.StudentVerification || mongoose.model('StudentVerification', studentVerificationSchema, 'student_verifications');

