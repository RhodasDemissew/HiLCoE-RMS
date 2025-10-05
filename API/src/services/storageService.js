import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

export function ensureStorage() {
  if (!config.storageDir) {
    throw new Error('Storage directory is not defined in the configuration.');
  }
  if (!fs.existsSync(config.storageDir)) {
    fs.mkdirSync(config.storageDir, { recursive: true });
  }
}

export async function saveBase64File(projectId, filename, base64, mimetype) {
  ensureStorage();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const dir = path.join(config.storageDir, String(projectId));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${id}-${safeName}`);
  const buf = Buffer.from(base64, 'base64');
  await fs.promises.writeFile(filePath, buf);
  return { filename: safeName, path: filePath, mimetype, size: buf.length };
}

export function getFileStream(filePath) {
  return fs.createReadStream(filePath);
}

export async function saveBufferFile(folder, filename, buffer, mimetype) {
  ensureStorage();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const dir = path.join(config.storageDir, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${id}-${safeName}`);
  await fs.promises.writeFile(filePath, buffer);
  return { filename: safeName, path: filePath, mimetype, size: buffer.length };
}


