import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

import supabase from '../../lib/supabaseClient';

export async function POST(request: Request): Promise<NextResponse> {
  // Only signed-in admins may upload: the admin sends its Supabase access token, which Supabase verifies.
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  const { data, error } = token ? await supabase.auth.getUser(token) : { data: { user: null }, error: null };
  if (error || !data.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }
  const body = request.body;
  if (!body) {
    return NextResponse.json({ error: 'No file provided in the request body' }, { status: 400 });
  }

  const blob = await put(filename, request.body, {
    access: 'public',
    addRandomSuffix: true,
  });

  return NextResponse.json(blob);
}
