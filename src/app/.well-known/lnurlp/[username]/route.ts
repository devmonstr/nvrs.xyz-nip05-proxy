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

  const targetUrl = `https://${lnDomain}/.well-known/lnurlp/${lnName}`;

  try {
    const resp = await fetch(targetUrl);
    if (!resp.ok) {
      return corsResponse({ status: 'ERROR', reason: 'Failed to fetch upstream' }, 502);
    }
    const lnurlData = await resp.json();

    return corsResponse(lnurlData);
  } catch (err: unknown) {
    const error = err as Error;
    return corsResponse({ status: 'ERROR', reason: 'Exception: ' + error.message }, 500);
  }
}

interface LnurlPayResponse {
  status: 'OK' | 'ERROR';
  reason?: string;
  callback?: string;
  tag?: string;
  maxSendable?: number;
  minSendable?: number;
  metadata?: string;
  commentAllowed?: number;
  payerData?: {
    name?: { mandatory: boolean };
    email?: { mandatory: boolean };
  };
}

function corsResponse(body: LnurlPayResponse, status: number = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
