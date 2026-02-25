/**
 * CSV parse and generate utilities with proper quote handling.
 * Used for import/export of clients, deals, contacts, tasks, etc.
 */

/**
 * Parse a CSV string into an array of rows (each row is an array of strings).
 * Handles quoted fields containing commas, newlines, and escaped quotes (double-quote).
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        row.push(field);
        field = "";
        i++;
      } else if (ch === "\r") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
        if (i < text.length && text[i] === "\n") {
          i++;
        }
      } else if (ch === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Parse CSV text into an array of objects using the first row as headers.
 * Returns objects keyed by trimmed, lowercased header names.
 */
export function parseCsvWithHeaders(
  text: string
): { headers: string[]; rows: Record<string, string>[] } {
  const allRows = parseCsv(text);
  if (allRows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = allRows[0].map((h) => h.trim());
  const dataRows: Record<string, string>[] = [];

  for (let i = 1; i < allRows.length; i++) {
    const row = allRows[i];
    // Skip empty rows
    if (row.length === 1 && row[0].trim() === "") continue;

    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = j < row.length ? row[j].trim() : "";
    }
    dataRows.push(obj);
  }

  return { headers, rows: dataRows };
}

/**
 * Escape a field value for CSV output.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 */
function escapeField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

/**
 * Generate a CSV string from an array of objects.
 * Uses the provided column definitions to determine header names and value accessors.
 */
export function generateCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { header: string; key: string }[]
): string {
  const headerLine = columns.map((c) => escapeField(c.header)).join(",");
  const dataLines = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        return escapeField(val == null ? "" : String(val));
      })
      .join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}

/**
 * Generate a CSV template string with only the header row.
 */
export function generateCsvTemplate(
  columns: { header: string }[]
): string {
  return columns.map((c) => escapeField(c.header)).join(",");
}
