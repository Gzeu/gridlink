import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key:  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export function extractSheetId(urlOrId: string): string | null {
  if (/^[a-zA-Z0-9-_]{30,}$/.test(urlOrId)) return urlOrId;
  const match = urlOrId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}

export async function getSheetData(
  sheetId: string,
  range  = 'A1:ZZ1000',
  tab?:    string,
): Promise<(Record<string, string> & { _id: number })[]> {
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
    (headers as string[]).forEach((h, j) => { obj[h] = (row[j] as string) ?? ''; });
    return obj;
  });
}

export async function appendRow(
  sheetId: string,
  values:  string[],
  tab    = 'Sheet1',
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

export async function updateRow(
  sheetId:   string,
  rowNumber: number,
  values:    Record<string, string>,
  tab      = 'Sheet1',
) {
  const sheets  = google.sheets({ version: 'v4', auth: getAuth() });
  const headers = await getSheetData(sheetId, 'A1:ZZ1', tab);
  const keys    = Object.keys(headers[0] ?? {}).filter(k => k !== '_id');
  const rowVals = keys.map(h => values[h] ?? '');

  const { data } = await sheets.spreadsheets.values.update({
    spreadsheetId:   sheetId,
    range:           `${tab}!A${rowNumber}:ZZ${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody:     { values: [rowVals] },
  });
  return data;
}

export async function getSheetMeta(sheetId: string) {
  const sheets   = google.sheets({ version: 'v4', auth: getAuth() });
  const { data } = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  return {
    title: data.properties?.title,
    tabs:  data.sheets?.map(s => s.properties?.title) ?? [],
  };
}

export async function validateSheetAccess(sheetId: string): Promise<boolean> {
  try { await getSheetMeta(sheetId); return true; }
  catch { return false; }
}
