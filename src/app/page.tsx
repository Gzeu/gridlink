'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Zap, 
  Database, 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  Shield,
  Rocket
} from 'lucide-react';

export default function Home() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);

  const validateSheetUrl = (url: string): boolean => {
    const pattern = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/;
    return pattern.test(url);
  };

  const handleUrlChange = (value: string) => {
    setSheetUrl(value);
    if (value.trim()) {
      setIsValidUrl(validateSheetUrl(value));
    } else {
      setIsValidUrl(null);
    }
  };

  const handleGenerateAPI = async () => {
    if (!sheetUrl.trim()) {
      toast.error('Please enter a Google Sheets URL');
      return;
    }
    
    if (!validateSheetUrl(sheetUrl)) {
      toast.error('Invalid Google Sheets URL format');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sheets?sheetUrl=' + encodeURIComponent(sheetUrl));
      if (response.ok) {
        const newApiUrl = `${window.location.origin}/api/sheets?sheetUrl=${encodeURIComponent(sheetUrl)}`;
        setApiUrl(newApiUrl);
        toast.success('API endpoint generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate API');
      }
    } catch (error) {
      toast.error('Network error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
      
      <div className="min-h-screen space-y-16 pb-16">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/90 via-slate-800/50 to-slate-900/90 p-12"
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 animate-gradient-x" />
          
          <div className="relative z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 border border-blue-500/20">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Free Tier: 1000 API calls/month</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Turn Google Sheets
                </span>
                <br />
                <span className="text-slate-100">Into REST APIs</span>
              </h1>
              
              <p className="text-xl text-slate-300 max-w-2xl">
                No coding required. Paste your sheet URL, get a production-ready API in seconds.
                Powered by <span className="text-cyan-400 font-semibold">EGLD</span> blockchain payments.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4 max-w-3xl"
            >
              <div className="relative">
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                  className={`w-full rounded-xl bg-slate-900/80 backdrop-blur px-6 py-4 text-white border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isValidUrl === false 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : isValidUrl === true 
                      ? 'border-green-500/50 focus:border-green-500'
                      : 'border-slate-600 focus:border-blue-400'
                  }`}
                />
                {isValidUrl === true && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <Check className="h-5 w-5 text-green-400" />
                  </motion.div>
                )}
              </div>
              
              {isValidUrl === false && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Invalid URL format. Please use a valid Google Sheets link.
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateAPI}
                disabled={loading || !isValidUrl}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Rocket className="h-5 w-5" />
                    </motion.div>
                    <span>Generating API...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Generate API Endpoint</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* API Endpoint Result */}
        <AnimatePresence>
          {apiUrl && (
            <motion.section
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 rounded-2xl border border-green-500/30 bg-slate-800/50 p-8"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-2">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-100">Your API Endpoint is Ready</h2>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-900/80 p-6 border border-slate-700">
                  <div className="flex items-start justify-between gap-4">
                    <code className="text-sm text-green-400 break-all flex-1 font-mono">
                      {apiUrl}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(apiUrl)}
                      className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Code Examples */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      cURL Example
                    </h3>
                    <div className="rounded-lg bg-slate-900/80 p-4 border border-slate-700">
                      <code className="text-xs text-cyan-400 font-mono">
                        curl "{apiUrl}"
                      </code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      JavaScript Example
                    </h3>
                    <div className="rounded-lg bg-slate-900/80 p-4 border border-slate-700">
                      <code className="text-xs text-cyan-400 font-mono">
                        fetch("{apiUrl}")
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Rocket,
              title: 'Instant API',
              description: 'REST API generated in seconds, no configuration needed',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Database,
              title: 'Lightning Fast',
              description: 'Redis caching + Neon PostgreSQL + Vercel Edge Network',
              gradient: 'from-cyan-500 to-purple-500'
            },
            {
              icon: Wallet,
              title: 'EGLD Payments',
              description: 'Built-in crypto micropayments via MultiversX blockchain',
              gradient: 'from-purple-500 to-pink-500'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group rounded-2xl border border-slate-700 bg-slate-800/50 p-8 hover:border-slate-600 transition-all duration-200"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: 'Free API Calls', value: '1,000/mo' },
            { label: 'Response Time', value: '<100ms' },
            { label: 'Cache TTL', value: '1 hour' },
            { label: 'Uptime', value: '99.9%' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.05, duration: 0.4 }}
              className="rounded-xl border border-slate-700 bg-slate-800/30 p-6 text-center"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.section>
      </div>
    </>
  );
}
