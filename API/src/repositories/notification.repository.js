import { Notification } from '../models/Notification.js';

export const notificationRepo = {
  listForUser: (userId) => Notification.find({ user: userId }).sort({ created_at: -1 }).limit(100),
  markRead: (userId, id) => Notification.findOneAndUpdate({ _id: id, user: userId }, { $set: { read_at: new Date() } }, { new: true }),
};

