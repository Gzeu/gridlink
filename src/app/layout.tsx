import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gridlink - Google Sheets to REST API',
  description: 'Turn any Google Sheet into a REST API instantly with EGLD payments',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="app" className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
          <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Gridlink
                  </div>
                  <span className="text-sm text-slate-400">Google Sheets → API</span>
                </div>
                <div className="text-sm text-slate-400">Powered by EGLD</div>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-slate-700 bg-slate-900/50 py-8 text-center text-sm text-slate-400">
            <p>
              © 2025 Gridlink. Free tier: 1000 API calls/month. Built with{' '}
              <a href="https://neon.tech" className="text-blue-400 hover:text-blue-300">
                Neon
              </a>
              {' '}× {' '}
              <a href="https://upstash.com" className="text-blue-400 hover:text-blue-300">
                Upstash
              </a>
              {' '}× {' '}
              <a href="https://multiversx.com" className="text-blue-400 hover:text-blue-300">
                MultiversX
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
