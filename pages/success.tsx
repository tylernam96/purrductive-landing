import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Check, Download, Key, Mail } from 'lucide-react';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session_id) {
      fetchSessionData(session_id as string);
    }
  }, [session_id]);

  const fetchSessionData = async (sessionId: string) => {
    try {
      const response = await fetch('/api/get-session-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
        setLicenseKey(data.licenseKey);
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLicenseKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🐱</div>
          <p className="text-white text-xl">Processing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Welcome to Purrductive Pro! 🎉</title>
        <meta name="description" content="Your purchase was successful. Get ready to boost your productivity!" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Animation */}
            <div className="text-8xl mb-8 animate-bounce">🎉</div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Purrductive Pro!
            </h1>
            
            <p className="text-xl text-gray-300 mb-12">
              Your payment was successful! Your productivity cat is excited to start working with you.
            </p>

            {/* License Key Section */}
            {licenseKey && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Key className="w-8 h-8 text-blue-400 mr-3" />
                  <h2 className="text-2xl font-semibold text-white">Your License Key</h2>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                  <code className="text-green-400 text-lg font-mono tracking-wider">
                    {licenseKey}
                  </code>
                </div>
                
                <button
                  onClick={copyLicenseKey}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy License Key'}
                </button>
                
                <p className="text-gray-400 text-sm mt-4">
                  Save this license key - you'll need it to activate the extension
                </p>
              </div>
            )}

            {/* Installation Steps */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Next Steps</h2>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Download the Extension</h3>
                    <p className="text-gray-300">
                      Download the Purrductive extension from the Chrome Web Store or our website.
                    </p>
                    <button className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download Extension
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Install & Activate</h3>
                    <p className="text-gray-300">
                      Install the extension in Chrome and enter your license key to activate Pro features.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Start Being Productive!</h3>
                    <p className="text-gray-300">
                      Your productivity cat will start tracking your habits immediately. Watch it thrive as you focus!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}