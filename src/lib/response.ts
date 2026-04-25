import { NextResponse } from 'next/server';

type ApiSuccess<T> = { success: true; data: T; error: null };
type ApiError = { success: false; data: null; error: string };

export function ok<T>(data: T, status = 200): NextResponse {
  const body: ApiSuccess<T> = { success: true, data, error: null };
  return NextResponse.json(body, { status });
}

export function err(message: string, status = 400): NextResponse {
  const body: ApiError = { success: false, data: null, error: message };
  return NextResponse.json(body, { status });
}
