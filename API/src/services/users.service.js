import { userRepo, roleRepo } from '../repositories/user.repository.js';
import { UserPreferences } from '../models/UserPreferences.js';
import { verifyPassword, hashPassword } from '../utils/crypto.js';

export const usersService = {
  async list() {
    const users = await userRepo.list();
    return users.map(u => ({
      id: u._id,
      name: u.name,
      first_name: u.first_name,
      middle_name: u.middle_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      role: u.role?.name,
      status: u.status,
      student_id: u.student_id,
    }));
  },
  async create({ name, email, roleName }) {
    const role = await roleRepo.findByName(roleName);
    if (!role) throw new Error('Invalid role');
    const u = await userRepo.create({ name, email: String(email).toLowerCase(), role: role._id, status: 'inactive' });
    return { id: u._id };
  },

  async updateProfile(userId, profileData) {
    const allowedFields = ['name', 'first_name', 'middle_name', 'last_name', 'email', 'phone', 'department', 'bio'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (profileData[field] !== undefined && profileData[field] !== null) {
        updateData[field] = profileData[field];
      }
    }

    // Only check email uniqueness if email is being changed
    if (updateData.email) {
      updateData.email = String(updateData.email).toLowerCase();
      
      // Get current user to check if email is actually changing
      const currentUser = await userRepo.findById(userId);
      if (!currentUser) throw new Error('User not found');
      
      // Only check for email conflicts if the email is actually different
      if (currentUser.email !== updateData.email) {
        const existingUser = await userRepo.findByEmail(updateData.email);
        if (existingUser) {
          throw new Error('Email is already taken by another user');
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update');
    }

    const user = await userRepo.updateById(userId, updateData);
    if (!user) throw new Error('User not found');
    
    // Sync name changes to related StudentVerification records
    const hasNameUpdate = updateData.name || updateData.first_name || updateData.middle_name || updateData.last_name;
    if (hasNameUpdate) {
      const { StudentVerification } = await import('../models/StudentVerification.js');
      
      // Update by student_verification reference if it exists
      if (user.student_verification) {
        await StudentVerification.findByIdAndUpdate(
          user.student_verification,
          { 
            first_name: user.first_name || '',
            middle_name: user.middle_name || '',
            last_name: user.last_name || ''
          }
        ).catch(() => {}); // Ignore errors if record doesn't exist
      }
      
      // Also update by student_id if it matches (in case reference is missing)
      if (user.student_id) {
        await StudentVerification.updateMany(
          { student_id: { $regex: `^${user.student_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
          { 
            first_name: user.first_name || '',
            middle_name: user.middle_name || '',
            last_name: user.last_name || ''
          }
        ).catch(() => {}); // Ignore errors
      }
    }

    // Sync name changes to Supervisor records and update assigned_supervisor names
    const { Supervisor } = await import('../models/Supervisor.js');
    const { StudentVerification } = await import('../models/StudentVerification.js');
    const supervisor = await Supervisor.findOne({ user: userId });
    if (supervisor && hasNameUpdate) {
      supervisor.first_name = user.first_name || '';
      supervisor.middle_name = user.middle_name || '';
      supervisor.last_name = user.last_name || '';
      await supervisor.save();
    }

    // Update all StudentVerification records that have this supervisor assigned
    // (supervisor_id can be either User ID or Supervisor document ID)
    if (hasNameUpdate) {
      const supervisorDocId = supervisor ? String(supervisor._id) : null;
      
      // Update where supervisor_id is the User ID
      await StudentVerification.updateMany(
        { 'assigned_supervisor.supervisor_id': userId },
        { 
          'assigned_supervisor.supervisor_name': user.name,
          'assigned_supervisor.supervisor_email': user.email || ''
        }
      ).catch(() => {}); // Ignore errors
      
      // Also update where supervisor_id is the Supervisor document ID
      if (supervisorDocId) {
        await StudentVerification.updateMany(
          { 'assigned_supervisor.supervisor_id': supervisorDocId },
          { 
            'assigned_supervisor.supervisor_name': user.name,
            'assigned_supervisor.supervisor_email': user.email || supervisor.email || ''
          }
        ).catch(() => {}); // Ignore errors
      }
    }
    
    return {
      id: user._id,
      name: user.name,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      bio: user.bio,
      role: user.role?.name,
      status: user.status,
      student_id: user.student_id,
    };
  },

  async updatePreferences(userId, preferencesData) {
    const allowedFields = [
      'email_notifications', 'push_notifications', 'weekly_digest', 'deadline_reminders', 'review_notifications',
      'theme', 'default_review_period', 'auto_approve_after', 'default_review_deadline',
      'auto_remind_before', 'max_students', 'research_area', 'preferred_meeting_times',
      'submission_reminders', 'review_updates'
    ];
    
    const updateData = {};
    for (const field of allowedFields) {
      if (preferencesData[field] !== undefined) {
        updateData[field] = preferencesData[field];
      }
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return {
      id: preferences._id,
      user: preferences.user,
      email_notifications: preferences.email_notifications,
      push_notifications: preferences.push_notifications,
      weekly_digest: preferences.weekly_digest,
      deadline_reminders: preferences.deadline_reminders,
      review_notifications: preferences.review_notifications,
      theme: preferences.theme,
      default_review_period: preferences.default_review_period,
      auto_approve_after: preferences.auto_approve_after,
      default_review_deadline: preferences.default_review_deadline,
      auto_remind_before: preferences.auto_remind_before,
      max_students: preferences.max_students,
      research_area: preferences.research_area,
      preferred_meeting_times: preferences.preferred_meeting_times,
      submission_reminders: preferences.submission_reminders,
      review_updates: preferences.review_updates,
    };
  },

  async getPreferences(userId) {
    const preferences = await UserPreferences.findOne({ user: userId });
    if (!preferences) {
      // Return default preferences
      return {
        email_notifications: true,
        push_notifications: true,
        weekly_digest: true,
        deadline_reminders: true,
        review_notifications: true,
        theme: 'light',
        default_review_period: 7,
        auto_approve_after: 14,
        default_review_deadline: 5,
        auto_remind_before: 2,
        max_students: 10,
        research_area: '',
        preferred_meeting_times: 'afternoon',
        submission_reminders: true,
        review_updates: true,
        two_factor_enabled: false,
      };
    }

    return {
      id: preferences._id,
      user: preferences.user,
      email_notifications: preferences.email_notifications,
      push_notifications: preferences.push_notifications,
      weekly_digest: preferences.weekly_digest,
      deadline_reminders: preferences.deadline_reminders,
      review_notifications: preferences.review_notifications,
      theme: preferences.theme,
      default_review_period: preferences.default_review_period,
      auto_approve_after: preferences.auto_approve_after,
      default_review_deadline: preferences.default_review_deadline,
      auto_remind_before: preferences.auto_remind_before,
      max_students: preferences.max_students,
      research_area: preferences.research_area,
      preferred_meeting_times: preferences.preferred_meeting_times,
      submission_reminders: preferences.submission_reminders,
      review_updates: preferences.review_updates,
    };
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    if (!user.password) throw new Error('No password set');

    const isCurrentPasswordValid = verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) throw new Error('Current password is incorrect');

    const hashedPassword = hashPassword(newPassword);
    await userRepo.updateById(userId, { password: hashedPassword });

    return { success: true };
  }
};
