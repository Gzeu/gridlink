'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import { X, ExternalLink, Copy, CheckCircle2, Loader2, Database } from 'lucide-react';

interface Props {
  open:    boolean;
  onClose: () => void;
  onCreated?: (key: { apiKey: string; endpoint: string; apiName: string }) => void;
}

export default function CreateApiModal({ open, onClose, onCreated }: Props) {
  const { userId } = useAuth();
  const [step,      setStep]     = useState<'form' | 'done'>('form');
  const [loading,   setLoading]  = useState(false);
  const [copied,    setCopied]   = useState<'key' | 'endpoint' | null>(null);

  const [sheetUrl,  setSheetUrl] = useState('');
  const [apiName,   setApiName]  = useState('');
  const [tab,       setTab]      = useState('');

  const [result, setResult] = useState<{
    apiKey:   string;
    endpoint: string;
    apiName:  string;
    examples: { curl: string; javascript: string; python: string };
  } | null>(null);

  const reset = () => {
    setStep('form');
    setSheetUrl('');
    setApiName('');
    setTab('');
    setResult(null);
    setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error('Not signed in');
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      return toast.error('Please enter a valid Google Sheets URL');
    }

    setLoading(true);
    try {
      // Ensure user exists in DB
      const meRes = await fetch('/api/users/sync', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ clerkId: userId, email: '' }),
      });
      const { data: meData } = await meRes.json();

      const res = await fetch('/api/keys', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          userId:   meData.id,
          sheetUrl,
          sheetName: tab || undefined,
          apiName:  apiName || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Failed to create API');
      }

      setResult(json.data);
      setStep('done');
      onCreated?.(json.data);
      toast.success('API key created!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, field: 'key' | 'endpoint') => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={  { opacity: 0, scale: 0.95, y: 20  }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Database className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">
                      {step === 'form' ? 'Create API from Sheet' : 'API Key Created ✅'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {step === 'form' ? 'Paste your Google Sheet URL to generate an endpoint' : 'Save your key — you won\'t see it again'}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {step === 'form' ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        Google Sheet URL <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="url"
                        value={sheetUrl}
                        onChange={e => setSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        required
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Share the sheet with <span className="text-blue-400 font-mono">{process.env.NEXT_PUBLIC_SERVICE_ACCOUNT_EMAIL ?? 'the service account email'}</span> first.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">API Name</label>
                      <input
                        type="text"
                        value={apiName}
                        onChange={e => setApiName(e.target.value)}
                        placeholder="My Inventory API"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Tab Name <span className="text-slate-500">(optional)</span></label>
                      <input
                        type="text"
                        value={tab}
                        onChange={e => setTab(e.target.value)}
                        placeholder="Sheet1"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 px-4 py-3 text-sm font-semibold text-white transition-colors">
                      {loading
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Validating sheet access...</>
                        : 'Generate API Key →'}
                    </button>
                  </form>
                ) : result ? (
                  <div className="space-y-4">
                    {/* API Key */}
                    <div className="rounded-lg bg-slate-800 border border-slate-700 p-4">
                      <p className="text-xs text-slate-500 mb-2">Your API Key</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono text-green-400 truncate">{result.apiKey}</code>
                        <button onClick={() => copy(result.apiKey, 'key')}
                          className="p-1.5 rounded hover:bg-slate-700 transition-colors">
                          {copied === 'key'
                            ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                            : <Copy className="h-4 w-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    {/* Endpoint */}
                    <div className="rounded-lg bg-slate-800 border border-slate-700 p-4">
                      <p className="text-xs text-slate-500 mb-2">Your Endpoint</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs font-mono text-blue-400 truncate">{result.endpoint}</code>
                        <button onClick={() => copy(result.endpoint, 'endpoint')}
                          className="p-1.5 rounded hover:bg-slate-700 transition-colors">
                          {copied === 'endpoint'
                            ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                            : <Copy className="h-4 w-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick example */}
                    <div className="rounded-lg bg-slate-950 border border-slate-800 p-4">
                      <p className="text-xs text-slate-500 mb-2">cURL Quick Test</p>
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">{result.examples.curl}</pre>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={reset}
                        className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                        Create Another
                      </button>
                      <button onClick={handleClose}
                        className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors">
                        Done
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
