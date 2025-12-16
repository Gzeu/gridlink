import { google } from 'googleapis';

export async function getSheetData(sheetId: string, range = 'A1:ZZ1000') {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const [headers, ...rows] = response.data.values || [];
    if (!headers) return [];

    return rows.map((row, index) => {
      const obj: any = { _id: index + 2 };
      headers.forEach((header: string, i: number) => {
        obj[header] = row[i] || '';
      });
      return obj;
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error(`Failed to fetch sheet: ${error}`);
  }
}

export async function appendRow(sheetId: string, values: string[]) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending row:', error);
    throw new Error(`Failed to append row: ${error}`);
  }
}

export async function updateRow(sheetId: string, rowNumber: number, values: any) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:ZZ1',
    });
    
    const headers = headersResponse.data.values?.[0] || [];
    const rowValues = headers.map((h: string) => values[h] || '');

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `A${rowNumber}:ZZ${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowValues] },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating row:', error);
    throw new Error(`Failed to update row: ${error}`);
  }
}

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export async function validateSheetAccess(sheetId: string): Promise<boolean> {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    return true;
  } catch (error) {
    return false;
  }
}
