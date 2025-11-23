import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

export function ensureStorage() {
  if (!config.storageDir) {
    throw new Error('Storage directory is not defined in the configuration.');
  }
  const base = path.isAbsolute(config.storageDir)
    ? config.storageDir
    : path.resolve(process.cwd(), config.storageDir);
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }
}

export async function saveBase64File(projectId, filename, base64, mimetype) {
  ensureStorage();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const base = path.isAbsolute(config.storageDir)
    ? config.storageDir
    : path.resolve(process.cwd(), config.storageDir);
  const dir = path.resolve(base, String(projectId));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.resolve(dir, `${id}-${safeName}`);
  const buf = Buffer.from(base64, 'base64');
  await fs.promises.writeFile(filePath, buf);
  return { filename: safeName, path: filePath, mimetype, size: buf.length };
}

export function getFileStream(filePath) {
  const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  return fs.createReadStream(resolved);
}

export async function saveBufferFile(folder, filename, buffer, mimetype) {
  ensureStorage();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const safeName = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const base = path.isAbsolute(config.storageDir)
    ? config.storageDir
    : path.resolve(process.cwd(), config.storageDir);
  const dir = path.resolve(base, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.resolve(dir, `${id}-${safeName}`);
  await fs.promises.writeFile(filePath, buffer);
  return { filename: safeName, path: filePath, mimetype, size: buffer.length };
}


