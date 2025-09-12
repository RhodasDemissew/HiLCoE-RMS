import { notificationRepo } from '../repositories/notification.repository.js';

export const notificationsService = {
  listForUser: (userId) => notificationRepo.listForUser(userId),
  markRead: (userId, id) => notificationRepo.markRead(userId, id)
};

