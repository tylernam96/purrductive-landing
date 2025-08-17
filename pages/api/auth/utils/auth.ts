// utils/auth.ts
import type { NextApiRequest } from 'next';
import { supabase } from './supabase';

export function getSessionFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const sessionCookie = cookies
    .split(';')
    .find(cookie => cookie.trim().startsWith('session='));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

export async function getCurrentUser(req: NextApiRequest) {
  const sessionToken = getSessionFromCookie(req);

  if (!sessionToken) {
    return null;
  }

  try {
    // Get session and user data
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        user_id,
        expires_at,
        users (*)
      `)
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      return null;
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);
      
      return null;
    }

    // Update last accessed time
    await supabase
      .from('user_sessions')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('session_token', sessionToken);

    return session.users;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}