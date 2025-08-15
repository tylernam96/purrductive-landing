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
    const { licenseKey, email } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ 
        error: 'License key is required',
        isValid: false 
      });
    }

    // Verify license key in database
    const { data: license, error } = await supabase
      .from('license_keys')
      .select(`
        *,
        users!inner(email, has_paid)
      `)
      .eq('license_key', licenseKey)
      .eq('is_active', true)
      .single();

    if (error || !license) {
      return res.status(400).json({ 
        error: 'Invalid license key',
        isValid: false 
      });
    }

    // Optional: Check if email matches (for additional security)
    if (email && license.email !== email) {
      return res.status(400).json({ 
        error: 'License key does not match email',
        isValid: false 
      });
    }

    // Check if user has actually paid
    if (!license.users.has_paid) {
      return res.status(400).json({ 
        error: 'Payment not confirmed',
        isValid: false 
      });
    }

    // Update last used timestamp
    await supabase
      .from('license_keys')
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: license.usage_count + 1 || 1
      })
      .eq('license_key', licenseKey);

    return res.status(200).json({ 
      isValid: true,
      user: {
        email: license.users.email,
        licenseKey: license.license_key,
        activatedAt: license.created_at
      }
    });

  } catch (error) {
    console.error('Error verifying license:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      isValid: false 
    });
  }
}