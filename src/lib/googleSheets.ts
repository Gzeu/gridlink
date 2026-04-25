import { google } from 'googleapis';

/**
 * Build Google auth from environment variables.
 * Works in serverless (Vercel) — does NOT use keyFile.
 */
function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key:  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

/**
 * Extract a spreadsheet ID from a full Google Sheets URL or return the ID as-is.
 */
export function extractSheetId(urlOrId: string): string | null {
  if (/^[a-zA-Z0-9-_]{30,}$/.test(urlOrId)) return urlOrId;
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}

/**
 * Fetch all rows from a sheet tab as an array of objects keyed by header row.
 * Row 1 is treated as headers; each subsequent row becomes { _id, ...fields }.
 */
export async function getSheetData(
  sheetId: string,
  range = 'A1:ZZ1000',
  tab?: string,
): Promise<Array<Record<string, string> & { _id: number }>> {
  const sheets    = google.sheets({ version: 'v4', auth: getAuth() });
  const fullRange = tab ? `${tab}!${range}` : range;

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range:         fullRange,
  });

  const [headers, ...rows] = data.values ?? [];
  if (!headers) return [];

  return rows.map((row, i) => {
    const obj: Record<string, string> & { _id: number } = { _id: i + 2 };
    headers.forEach((h: string, j: number) => { obj[h] = row[j] ?? ''; });
    return obj;
  });
}

/**
 * Append a new row of values to the sheet.
 */
export async function appendRow(
  sheetId: string,
  values: string[],
  tab = 'Sheet1',
) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const { data } = await sheets.spreadsheets.values.append({
    spreadsheetId:   sheetId,
    range:           `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody:     { values: [values] },
  });
  return data;
}

/**
 * Overwrite a specific row (by 1-indexed row number) with new values.
 * Preserves column order from the header row.
 */
export async function updateRow(
  sheetId:   string,
  rowNumber: number,
  values:    Record<string, string>,
  tab = 'Sheet1',
) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });

  const headersRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range:         `${tab}!A1:ZZ1`,
  });
  const headers  = headersRes.data.values?.[0] ?? [];
  const rowValues = headers.map((h: string) => values[h] ?? '');

  const { data } = await sheets.spreadsheets.values.update({
    spreadsheetId:   sheetId,
    range:           `${tab}!A${rowNumber}:ZZ${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody:     { values: [rowValues] },
  });
  return data;
}

/**
 * Return spreadsheet title and list of tab names.
 */
export async function getSheetMeta(sheetId: string) {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const { data } = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  return {
    title: data.properties?.title ?? '',
    tabs:  data.sheets?.map(s => s.properties?.title ?? '') ?? [],
  };
}

/**
 * Returns true if the service account can access the sheet.
 */
export async function validateSheetAccess(sheetId: string): Promise<boolean> {
  try {
    await getSheetMeta(sheetId);
    return true;
  } catch {
    return false;
  }
}
