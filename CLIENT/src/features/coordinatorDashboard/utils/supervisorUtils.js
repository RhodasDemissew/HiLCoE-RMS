import Papa from "papaparse";
import * as XLSX from "xlsx";

export function formatFullName(supervisor) {
  if (!supervisor) return "";
  return [supervisor.first_name, supervisor.middle_name, supervisor.last_name]
    .filter((part) => part && part.trim())
    .join(" ")
    .trim();
}

export function parseSpecializationsCell(cell = "") {
  if (Array.isArray(cell)) return cell.map((item) => String(item || '').trim()).filter(Boolean);
  return String(cell || "")
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function parseSupervisorsFile(file) {
  const errors = [];
  const entries = [];
  if (!file) return { entries, errors };

  const buffer = await file.arrayBuffer();
  if (!buffer.byteLength) {
    errors.push({ row: 1, reason: "File is empty" });
    return { entries, errors };
  }

  const isCsv = file.name.toLowerCase().endsWith('.csv');

  const rows = isCsv
    ? parseCsv(new TextDecoder().decode(buffer))
    : parseSheet(buffer);

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // account for header
    const firstName = (row.FirstName || row.firstName || row.first_name || "").trim();
    const middleName = (row.MiddleName || row.middleName || row.middle_name || "").trim();
    const lastName = (row.LastName || row.lastName || row.last_name || "").trim();
    const email = (row.Email || row.email || "").trim();
    const supervisorId = (row.SupervisorID || row.supervisorId || row.supervisor_id || "").trim();
    const specializationCell =
      row.Specialization || row.specialization || row.Specializations || row.specializations || "";
    const specializations = parseSpecializationsCell(specializationCell);

    if (!firstName || !lastName || !email || !supervisorId || !specializations.length) {
      errors.push({ row: rowNumber, reason: "Missing required fields" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.toLowerCase())) {
      errors.push({ row: rowNumber, reason: "Invalid email" });
      return;
    }

    entries.push({
      firstName,
      middleName,
      lastName,
      email: email.toLowerCase(),
      supervisorId,
      specializations,
      rowNumber,
    });
  });

  return { entries, errors };
}

function parseCsv(text) {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  return Array.isArray(data) ? data : [];
}

function parseSheet(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const [firstSheetName] = workbook.SheetNames;
  if (!firstSheetName) return [];
  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });
}
