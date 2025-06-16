import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  if (!username) {
    return corsResponse({ status: 'ERROR', reason: 'No username provided' }, 400);
  }

  // Get lightning_address from Supabase
  const { data, error } = await supabase
    .from('registered_users')
    .select('lightning_address')
    .eq('username', username)
    .single();

  if (error || !data || !data.lightning_address) {
    return corsResponse({ status: 'ERROR', reason: 'No lightning address found' }, 404);
  }

  const [lnName, lnDomain] = data.lightning_address.split('@');
  if (!lnName || !lnDomain) {
    return corsResponse({ status: 'ERROR', reason: 'Invalid lightning address' }, 400);
  }

  // Forward query string to the real callback
  const url = new URL(req.url);
  const search = url.search;
  const realCallback = `https://${lnDomain}/.well-known/lnurlp/${lnName}${search}`;

  try {
    const lnurlRes = await fetch(realCallback, {
      headers: {
        'Accept': 'application/json',
      },
    });
    const lnurlData = await lnurlRes.json();
    return corsResponse(lnurlData, lnurlRes.status);
  } catch {
    return corsResponse({ status: 'ERROR', reason: 'Proxy error' }, 502);
  }
}

function corsResponse(body: unknown, status: number = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
} 