import { StudentVerification } from '../models/StudentVerification.js';

function buildInsensitiveQuery(studentId) {
  return { student_id: new RegExp(`^${studentId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
}

export const studentVerificationRepo = {
  findByStudentId: (studentId) => StudentVerification.findOne(buildInsensitiveQuery(studentId.trim())),
  findByToken: (token) => StudentVerification.findOne({ signup_token: token }),
  markToken: async (doc, token, expiresAt) => {
    doc.signup_token = token;
    doc.signup_token_expires_at = expiresAt;
    await doc.save();
    return doc;
  },
  markVerified: async (doc, email) => {
    doc.verified_at = new Date();
    doc.verified_email = email;
    doc.signup_token = null;
    doc.signup_token_expires_at = null;
    await doc.save();
    return doc;
  }
};
