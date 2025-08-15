import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email, has_paid')
      .eq('email', email)
      .single();

    if (existingUser) {
      if (existingUser.has_paid) {
        return res.status(200).json({ 
          message: 'You already have access to Purrductive Pro!' 
        });
      } else {
        return res.status(200).json({ 
          message: 'You\'re already on our early access list!' 
        });
      }
    }

    // Add new email to early access list
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase().trim(),
          created_at: new Date().toISOString(),
          has_paid: false,
          is_early_access: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving email:', error);
      return res.status(500).json({ error: 'Failed to save email' });
    }

    return res.status(200).json({ 
      message: 'Thanks for joining! We\'ll notify you when Purrductive is ready.',
      userId: data.id
    });

  } catch (error) {
    console.error('Error in collect-email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}