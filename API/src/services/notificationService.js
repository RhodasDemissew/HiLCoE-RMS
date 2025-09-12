import { Notification } from '../models/Notification.js';

export async function notify(userId, type, payload) {
  try {
    await Notification.create({ user: userId, type, payload });
  } catch {}
}

