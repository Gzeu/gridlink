'use client';
import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3 } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <html lang="en">
      <head>
        <title>Gridlink - Google Sheets to REST API</title>
        <meta name="description" content="Turn any Google Sheet into a REST API instantly with EGLD payments" />
      </head>
      <body>
        <div id="app" className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
          <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="flex items-center space-x-3 group">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300 transition-all">
                      Gridlink
                    </div>
                    <span className="text-sm text-slate-400">Google Sheets → API</span>
                  </Link>
                  
                  <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="text-sm text-slate-400 hidden sm:block">
                  Powered by <span className="text-cyan-400 font-semibold">EGLD</span>
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-slate-700 bg-slate-900/50 py-8 text-center text-sm text-slate-400">
            <p>
              © 2025 Gridlink. Free tier: 1000 API calls/month. Built with{' '}
              <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                Neon
              </a>
              {' '}× {' '}
              <a href="https://upstash.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                Upstash
              </a>
              {' '}× {' '}
              <a href="https://multiversx.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                MultiversX
              </a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
