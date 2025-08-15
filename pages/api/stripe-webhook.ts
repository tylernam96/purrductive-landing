import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { user_id, email } = session.metadata || {};
  
  if (!user_id || !email) {
    console.error('Missing metadata in session:', session.id);
    return;
  }

  try {
    // Update user as paid in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        has_paid: true,
        stripe_customer_id: session.customer as string,
        stripe_payment_intent_id: session.payment_intent as string,
        payment_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (error) {
      console.error('Error updating user payment status:', error);
      return;
    }

    // Generate a unique license key for the user
    const licenseKey = generateLicenseKey();
    
    // Store the license key
    const { error: licenseError } = await supabase
      .from('license_keys')
      .insert([
        {
          user_id: user_id,
          license_key: licenseKey,
          email: email,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]);

    if (licenseError) {
      console.error('Error creating license key:', licenseError);
      return;
    }

    console.log(`Payment successful for user ${email}, license key: ${licenseKey}`);
    
  } catch (error) {
    console.error('Error in handleSuccessfulPayment:', error);
  }
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-'); // Format: XXXX-XXXX-XXXX-XXXX
}