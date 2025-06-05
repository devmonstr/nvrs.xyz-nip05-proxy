import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  pubkey: z.string().regex(/^npub1[a-zA-Z0-9]{58}$/, 'Invalid Nostr public key format'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const { username, pubkey } = result.data;

    // TODO: Add your database logic here to store the registration
    // For example:
    // await db.users.create({
    //   data: {
    //     username,
    //     pubkey,
    //     nip05: `${username}@yourdomain.com`,
    //   },
    // });

    // Return success response
    return NextResponse.json({
      success: true,
      nip05: `${username}@yourdomain.com`,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 