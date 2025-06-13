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

  return corsResponse({
    status: 'OK',
    callback: `https://${lnDomain}/.well-known/lnurlp/${lnName}`,
    tag: 'payRequest',
    maxSendable: 100000000,
    minSendable: 1000,
    metadata: JSON.stringify([
      ["text/plain", `Pay to ${username}@nvrs.xyz`],
      ["text/identifier", `${username}@nvrs.xyz`]
    ]),
    commentAllowed: 120,
    payerData: {
      name: { mandatory: false },
      email: { mandatory: false }
    }
  });
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

