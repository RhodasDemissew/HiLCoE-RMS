import mongoose from 'mongoose';

const passwordSchema = new mongoose.Schema(
  {
    salt: { type: String },
    hash: { type: String },
    iterations: { type: Number },
    algo: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'active' },
    student_id: { type: String, default: '', trim: true },
    password: { type: passwordSchema, default: null },
    activation_token: { type: String, default: null },
    reset_token: { type: String, default: null },
    reset_expires_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
