import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get user data and license key from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        license_keys (license_key, created_at)
      `)
      .eq('stripe_session_id', session_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return session data with license key
    return res.status(200).json({
      sessionId: session_id,
      customerEmail: session.customer_email,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      licenseKey: user.license_keys?.[0]?.license_key || null,
      user: {
        email: user.email,
        hasPaid: user.has_paid,
        paymentCompletedAt: user.payment_completed_at
      }
    });

  } catch (error) {
    console.error('Error retrieving session data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}