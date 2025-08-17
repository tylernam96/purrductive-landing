import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const customerEmail = session.customer_details?.email;
    
    if (!customerEmail) {
      return res.status(400).json({ error: 'No customer email found' });
    }

    // Get user and license key from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_session_id', session_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get license key
    const { data: licenseData, error: licenseError } = await supabase
      .from('license_keys')
      .select('license_key')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (licenseError || !licenseData) {
      return res.status(404).json({ error: 'License key not found' });
    }

    res.status(200).json({
      customerEmail: customerEmail,
      licenseKey: licenseData.license_key,
      sessionId: session_id,
      paymentAmount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
    });

  } catch (error) {
    console.error('Error retrieving session data:', error);
    res.status(500).json({ error: 'Failed to retrieve session data' });
  }
}