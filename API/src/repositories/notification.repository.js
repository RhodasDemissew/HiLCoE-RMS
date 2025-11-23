import { Notification } from '../models/Notification.js';

export const notificationRepo = {
  listForUser: (userId) => Notification.find({ user: userId }).sort({ created_at: -1 }).limit(100),
  markRead: (userId, id) => Notification.findOneAndUpdate({ _id: id, user: userId }, { $set: { read_at: new Date() } }, { new: true }),
  markAllRead: (userId) => Notification.updateMany({ user: userId, read_at: { $exists: false } }, { $set: { read_at: new Date() } }),
  deleteAllForUser: (userId) => Notification.deleteMany({ user: userId }),
};

