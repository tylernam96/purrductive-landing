import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Check, Star, Clock, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: '' }), // Email not required for direct purchase
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Purrductive - Turn Your Browser Into a Productivity Powerhouse</title>
        <meta name="description" content="The Chrome extension that transforms your screen time into productive habits with your virtual productivity cat companion." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-3xl">🐱</div>
              <span className="text-xl font-bold text-white">Purrductive</span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
              <Link href="/login" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20">
                Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="text-6xl mb-6 animate-pulse">🐱</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Turn Your Browser Into a{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Productivity Powerhouse
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Meet your virtual productivity cat who thrives when you're productive and suffers when you're distracted. 
              Transform your screen time habits with real-time feedback, detailed analytics, and gamified productivity tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Opening Checkout...' : 'Get Started - $5'}
              </button>
              <Link href="/login" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-200">
                Already have an account?
              </Link>
            </div>
            
            {message && (
              <p className="mt-4 text-green-400 font-medium">{message}</p>
            )}

            <div className="mt-12 flex justify-center items-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span>Chrome Extension</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>Real-time Tracking</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Purrductive Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Science-backed features that turn productivity into a habit, not a chore.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl mb-4">😸</div>
              <h3 className="text-xl font-semibold text-white mb-4">Your Virtual Companion</h3>
              <p className="text-gray-300">
                Watch your productivity cat thrive when you focus and suffer when you're distracted. 
                Emotional feedback that actually motivates you to stay on track.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <Clock className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">Real-Time Tracking</h3>
              <p className="text-gray-300">
                Automatically categorizes websites as productive or distracting. 
                Set your daily screen time goals and get instant feedback on your progress.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-4">Detailed Analytics</h3>
              <p className="text-gray-300">
                Comprehensive history tracking with charts and insights. 
                See your productivity patterns and identify areas for improvement.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Fair Pricing</h2>
            <p className="text-xl text-gray-300">
              One-time purchase. Lifetime productivity improvement.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Purrductive Pro</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">$5</span>
                  <span className="text-gray-300 ml-2">one-time</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    'Virtual productivity cat companion',
                    'Real-time website categorization',
                    'Customizable screen time goals',
                    'Detailed productivity analytics',
                    'Historical data tracking',
                    'Custom website categories',
                    'Lifetime updates',
                    'No subscription fees'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Get Purrductive Pro'}
                </button>
                
                <p className="text-gray-400 text-sm mt-3">
                  Direct checkout - no account required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="text-center text-gray-400">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="text-2xl">🐱</div>
              <span className="text-lg font-semibold">Purrductive</span>
            </div>
            <p>&copy; 2024 Purrductive. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}