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
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    password: { type: passwordSchema, default: null },
    activation_token: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, collection: 'users' }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
