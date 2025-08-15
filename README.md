# Purrductive Landing Page

A complete landing page and backend system for the Purrductive Chrome extension with Stripe payments and license management.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Stripe and Supabase credentials

3. **Set up Supabase database:**
   - Create a new Supabase project
   - Run the SQL schema from `database-schema.sql`

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

## 📁 Project Structure

- `pages/` - Next.js pages and API routes
- `lib/` - Utility functions and configurations
- `database-schema.sql` - Supabase database setup

## 🔧 Environment Variables

See `.env.local.example` for all required environment variables.

## 💳 Stripe Setup

1. Create Stripe account
2. Get your API keys
3. Set up webhook endpoint: `/api/stripe-webhook`
4. Select events: `checkout.session.completed`

## 🗄️ Database Setup

Run the SQL commands in `database-schema.sql` in your Supabase SQL editor.

## 🚀 Deployment

Deploy to Vercel and configure environment variables in the dashboard.

## 📊 Features

- Email collection for early access
- Stripe checkout integration
- License key generation
- Extension license verification
- Success page with download instructions
