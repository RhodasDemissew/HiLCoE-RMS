import * as XLSX from 'xlsx';

function normalizeKey(key = '') {
  return key.replace(/\s+|_/g, '').toLowerCase();
}

function coerceString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value).trim();
  return String(value).trim();
}

export async function parseStudentFile(file) {
  const errors = [];
  if (!file) return { entries: [], errors: [{ index: 0, error: 'No file provided' }] };

  const buffer = await file.arrayBuffer();
  if (!buffer.byteLength) {
    return { entries: [], errors: [{ index: 0, error: 'File is empty' }] };
  }

  const workbook = XLSX.read(buffer, { type: 'array' });
  const [firstSheetName] = workbook.SheetNames;
  if (!firstSheetName) {
    return { entries: [], errors: [{ index: 0, error: 'No sheets found in file' }] };
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  if (!rows.length) {
    return { entries: [], errors: [{ index: 0, error: 'No rows found in file' }] };
  }

  const entries = [];
  const seenIds = new Set();

  rows.forEach((row, idx) => {
    const normalizedRow = {};
    Object.keys(row).forEach((key) => {
      normalizedRow[normalizeKey(key)] = row[key];
    });

    const firstName = coerceString(normalizedRow.firstname);
    const middleName = coerceString(normalizedRow.middlename ?? normalizedRow.mname ?? '');
    const lastName = coerceString(normalizedRow.lastname);
    const studentId = coerceString(normalizedRow.studentid ?? normalizedRow.student_id ?? normalizedRow.id);

    if (!firstName && !lastName && !studentId) {
      return; // skip blank lines
    }

    if (!firstName) {
      errors.push({ index: idx, error: 'First Name is required' });
      return;
    }
    if (!lastName) {
      errors.push({ index: idx, error: 'Last Name is required' });
      return;
    }
    if (!studentId) {
      errors.push({ index: idx, error: 'Student ID is required' });
      return;
    }

    const dedupeKey = studentId.toLowerCase();
    if (seenIds.has(dedupeKey)) {
      errors.push({ index: idx, student_id: studentId, error: 'Duplicate Student ID in file' });
      return;
    }
    seenIds.add(dedupeKey);

    entries.push({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      student_id: studentId,
      program,
    });
  });

  return { entries, errors };
}

