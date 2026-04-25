import { NextResponse } from 'next/server';

type ApiSuccess<T> = { success: true; data: T; error: null };
type ApiError = { success: false; data: null; error: string };

/**
 * Return a successful JSON response: { success: true, data, error: null }
 */
export function ok<T>(data: T, status = 200) {
  const body: ApiSuccess<T> = { success: true, data, error: null };
  return NextResponse.json(body, { status });
}

/**
 * Return an error JSON response: { success: false, data: null, error: message }
 */
export function err(message: string, status = 400) {
  const body: ApiError = { success: false, data: null, error: message };
  return NextResponse.json(body, { status });
}
