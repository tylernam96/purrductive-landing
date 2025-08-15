#!/bin/bash
echo "🚀 Setting up Purrductive Landing Page..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from example..."
  cp .env.local.example .env.local
  echo "⚠️  Please edit .env.local with your actual credentials"
fi

echo "✅ Setup complete!"
echo "📋 Next steps:"
echo "1. Edit .env.local with your Stripe and Supabase credentials"
echo "2. Set up your Supabase database using database-schema.sql"
echo "3. Run 'npm run dev' to start development server"
