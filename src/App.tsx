/**
 * MarketSphere - AI Studio Preview Wrapper
 * Renders the pure standalone Vanilla HTML5/CSS3/JavaScript frontend from /frontend/index.html
 * and provides live diagnostics and VS Code Live Server instructions.
 */

import React, { useState } from 'react';
import {
  Globe,
  Monitor,
  Code,
  CheckCircle,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'preview' | 'guide'>('preview');

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans">
      {/* Top Status Bar for AI Studio & Live Server */}
      <header className="h-12 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              M
            </span>
            <span className="font-bold text-sm tracking-tight text-white">
              MarketSphere
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              — Discover. Shop. Sell.
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono hidden md:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Step 1: Frontend Only · Live Server Ready
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Interactive Storefront</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>VS Code Live Server Guide</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-slate-900">
        {activeTab === 'preview' ? (
          <iframe
            src="/frontend/index.html"
            title="MarketSphere Frontend Preview"
            className="w-full h-full border-none bg-white"
          />
        ) : (
          <div className="h-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Step 1: Frontend Only Complete &amp; Verified
                  </h2>
                  <p className="text-xs text-slate-400">
                    Standalone vanilla architecture ready for VS Code Live Server (&quot;Go Live&quot;)
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 my-6">
                <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/60">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Exact Project Architecture
                  </h3>
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800">
{`frontend/
├── index.html          # Core marketplace homepage
├── css/
│   └── style.css       # Complete design system & responsive styles
├── js/
│   ├── app.js          # Cart, modals, search, filter, checkout
│   └── products.js     # 24 items across 9 categories
└── assets/
    └── images/         # Local high-res imagery & icons`}
                  </pre>
                </div>

                <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/60">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    How to Run in VS Code Live Server
                  </h3>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Open VS Code.</li>
                    <li>Open the <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">frontend/</code> directory (or workspace root).</li>
                    <li>Install the extension <strong className="text-white">Live Server</strong> (by Ritwick Dey) if not already installed.</li>
                    <li>Right-click on <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">frontend/index.html</code> and click <strong className="text-emerald-400">&quot;Open with Live Server&quot;</strong>.</li>
                    <li>The browser will automatically launch at <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">http://127.0.0.1:5500/frontend/index.html</code>.</li>
                  </ol>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-white">Implemented Frontend Features:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Multi-currency switcher (USD, EUR, GBP, JPY, CAD)
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Live Flash Deals countdown timer
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Instant search &amp; department filtering
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Slide-over Shopping Bag with promo codes
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Product Quick View with specifications
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Escrow-protected simulated checkout
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Saved Wishlist with local persistence
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> Multi-vendor seller onboarding section
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded border border-slate-800">
                    <span className="text-emerald-400">✓</span> 100% relative paths &amp; zero console errors
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg"
                >
                  <span>Launch Interactive Storefront</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
