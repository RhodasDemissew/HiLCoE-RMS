import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // Notification preferences
    email_notifications: { type: Boolean, default: true },
    push_notifications: { type: Boolean, default: true },
    weekly_digest: { type: Boolean, default: true },
    deadline_reminders: { type: Boolean, default: true },
    review_notifications: { type: Boolean, default: true },
    
    // Appearance preferences
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    
    // Role-specific preferences
    // For Coordinators
    default_review_period: { type: Number, default: 7 }, // days
    auto_approve_after: { type: Number, default: 14 }, // days
    
    // For Supervisors
    default_review_deadline: { type: Number, default: 5 }, // days
    auto_remind_before: { type: Number, default: 2 }, // days
    max_students: { type: Number, default: 10 },
    
    // For Researchers
    research_area: { type: String, default: '' },
    preferred_meeting_times: { type: String, enum: ['morning', 'afternoon', 'evening'], default: 'afternoon' },
    submission_reminders: { type: Boolean, default: true },
    review_updates: { type: Boolean, default: true },
    
  },
  { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'user_preferences'
  }
);

export const UserPreferences = mongoose.models.UserPreferences || mongoose.model('UserPreferences', userPreferencesSchema, 'user_preferences');
