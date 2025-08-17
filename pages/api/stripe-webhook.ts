import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import crypto from 'crypto';

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

// Generate a random license key
function generateLicenseKey(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-') || '';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const body = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // Get customer email from the session
      const customerEmail = session.customer_details?.email;
      
      if (!customerEmail) {
        console.error('No customer email found in session');
        return res.status(400).json({ error: 'No customer email found' });
      }

      // Check if user already exists
      let { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', customerEmail)
        .single();

      let userId;

      if (existingUser) {
        // User exists, update their payment info
        userId = existingUser.id;
        
        await supabase
          .from('users')
          .update({
            has_paid: true,
            stripe_customer_id: session.customer as string,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            payment_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      } else {
        // Create new user account automatically
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            email: customerEmail,
            has_paid: true,
            stripe_customer_id: session.customer as string,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            payment_completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (userError) {
          console.error('Error creating user:', userError);
          return res.status(500).json({ error: 'Failed to create user' });
        }

        userId = newUser.id;
      }

      // Generate and store license key
      const licenseKey = generateLicenseKey();
      
      const { error: licenseError } = await supabase
        .from('license_keys')
        .insert({
          user_id: userId,
          license_key: licenseKey,
          email: customerEmail,
          is_active: true,
        });

      if (licenseError) {
        console.error('Error creating license key:', licenseError);
        return res.status(500).json({ error: 'Failed to create license key' });
      }

      console.log(`Payment successful for ${customerEmail}, license key: ${licenseKey}`);

      // TODO: Send email with license key here
      // You can use a service like Resend, SendGrid, or Nodemailer
      // Example structure:
      /*
      await sendWelcomeEmail({
        to: customerEmail,
        licenseKey: licenseKey,
        downloadLink: 'https://your-extension-download-link.com'
      });
      */

    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: 'Failed to process payment' });
    }
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}