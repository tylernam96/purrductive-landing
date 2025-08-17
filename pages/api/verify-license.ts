// pages/api/verify-license.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { licenseKey, email } = req.body

    if (!licenseKey) {
      return res.status(400).json({ 
        valid: false, 
        message: 'License key is required' 
      })
    }

    // Check if license key exists and is active
    const { data: licenseData, error } = await supabaseAdmin
      .from('license_keys')
      .select(`
        *,
        users!inner(
          email,
          has_paid,
          is_early_access
        )
      `)
      .eq('license_key', licenseKey)
      .eq('is_active', true)
      .single()

    if (error || !licenseData) {
      return res.status(200).json({ 
        valid: false, 
        message: 'Invalid or inactive license key' 
      })
    }

    // Update last used timestamp and usage count
    await supabaseAdmin
      .from('license_keys')
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: licenseData.usage_count + 1
      })
      .eq('id', licenseData.id)

    // Check if user has paid or has early access
    const hasAccess = licenseData.users.has_paid || licenseData.users.is_early_access

    return res.status(200).json({
      valid: hasAccess,
      message: hasAccess ? 'License valid' : 'Payment required',
      userEmail: licenseData.users.email,
      isPaid: licenseData.users.has_paid,
      isEarlyAccess: licenseData.users.is_early_access
    })

  } catch (error) {
    console.error('License verification error:', error)
    res.status(500).json({ 
      valid: false, 
      message: 'Internal server error' 
    })
  }
}