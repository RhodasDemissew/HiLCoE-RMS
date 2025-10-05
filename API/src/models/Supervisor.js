import mongoose from 'mongoose';

const supervisorSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    middle_name: { type: String, trim: true, default: '' },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    supervisor_id: { type: String, required: true, unique: true, trim: true },
    specializations: { type: [String], default: [] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'supervisors' }
);

supervisorSchema.pre('save', function normaliseSpecializations(next) {
  if (Array.isArray(this.specializations)) {
    this.specializations = this.specializations
      .map((item) => (item || '').toString().trim())
      .filter(Boolean)
      .map((item) => item.replace(/\s+/g, ' '));
  }
  next();
});

export const Supervisor = mongoose.models.Supervisor || mongoose.model('Supervisor', supervisorSchema, 'supervisors');
