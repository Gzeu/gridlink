'use client';
import { useState } from 'react';
export default function Home() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const handleGenerateAPI = async () => {
    if (!sheetUrl.trim()) return alert('Please enter a Google Sheets URL');
    setLoading(true);
    try {
      const response = await fetch('/api/sheets?sheetUrl=' + encodeURIComponent(sheetUrl));
      if (response.ok) {
        const newApiUrl = `${window.location.origin}/api/sheets?sheetUrl=${encodeURIComponent(sheetUrl)}`;
        setApiUrl(newApiUrl);
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-700 bg-slate-800/50 p-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Google Sheets → REST API
        </h1>
        <p className="text-lg text-slate-300 mb-8">
          Turn any Google Sheet into a live REST API. No coding required.
        </p>
        <div className="space-y-4">
          <input
            type="url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-white border border-slate-600 focus:border-blue-400"
          />
          <button
            onClick={handleGenerateAPI}
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-medium text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate API'}
          </button>
        </div>
      </section>
      {apiUrl && (
        <section className="rounded-lg border border-slate-700 bg-slate-800/50 p-8">
          <h2 className="text-2xl font-bold mb-4 text-slate-100">Your API Endpoint</h2>
          <div className="rounded-lg bg-slate-900 p-4">
            <code className="text-sm text-green-400 break-all">{apiUrl}</code>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(apiUrl)}
            className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
          >
            Copy to Clipboard
          </button>
        </section>
      )}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="text-2xl mb-2">🚀</div>
          <h3 className="font-bold text-slate-100 mb-2">Instant API</h3>
          <p className="text-sm text-slate-400">REST API in seconds</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-bold text-slate-100 mb-2">Lightning Fast</h3>
          <p className="text-sm text-slate-400">Neon × Upstash × Vercel</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="text-2xl mb-2">💳</div>
          <h3 className="font-bold text-slate-100 mb-2">EGLD Payments</h3>
          <p className="text-sm text-slate-400">Crypto micropayments</p>
        </div>
      </section>
    </div>
  );
}
