'use client';

import React, { useState } from 'react';
import { Terminal, Cpu, Shield, Layers, Code2, Server, Moon, Sun, Laptop, Database } from 'lucide-react';

export default function AboutPage() {
  const [isDark, setIsDark] = useState(false);

  const architectureHighlights = [
    {
      icon: <Cpu className="w-6 h-6 text-violet-500 dark:text-violet-300" />,
      title: "Self-Hosted Judge0 Engine",
      description: "Code execution is offloaded to a self-hosted Judge0 instance running inside Docker containers for robust, multi-language code evaluation."
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-500 dark:text-emerald-300" />,
      title: "Sandboxed Isolation",
      description: "Judge0 isolates user submissions inside secure containers with strict execution timeouts, memory caps, and system call limits."
    },
    {
      icon: <Database className="w-6 h-6 text-pink-500 dark:text-pink-300" />,
      title: "Serverless PostgreSQL (Neon)",
      description: "Problem metadata, submission history, and user data are persisted reliably using Neon's serverless PostgreSQL managed via Prisma ORM."
    },
    {
      icon: <Server className="w-6 h-6 text-sky-500 dark:text-sky-300" />,
      title: "Express API Gateway",
      description: "Acts as the central backend orchestrator, formatting submission payloads, communicating with Judge0, and storing verdicts."
    }
  ];

  const techStack = [
    { category: "Frontend", tech: "Next.js, Tailwind CSS, Monaco Editor" },
    { category: "Backend Engine", tech: "Node.js / Express API Server" },
    { category: "Execution Engine", tech: "Judge0 API (Self-Hosted on Docker)" },
    { category: "Database & Storage", tech: "PostgreSQL (Neon DB), Prisma ORM" }
  ];

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-rose-50/50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 font-sans">
        
        {/* Top Bar / Theme Toggle */}
        <header className="max-w-5xl mx-auto pt-8 px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Laptop className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Code</span>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-medium hover:scale-105 transition-all"
          >
            {isDark ? (
              <><Sun className="w-4 h-4 text-amber-400" /> Light Mode</>
            ) : (
              <><Moon className="w-4 h-4 text-purple-600" /> Dark Mode</>
            )}
          </button>
        </header>

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800/50 bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>docker run -p 2358:2358 judge0/judge0</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            About <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">Code</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
            A full-stack competitive programming platform powered by a self-hosted <strong>Judge0 API engine</strong> running on Docker.
          </p>
        </section>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
          
          {/* System Architecture Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Code2 className="text-purple-600 dark:text-purple-400" /> How It Works
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                <strong>Code</strong> connects a modern Next.js interface with an Express backend, leveraging a dockerized <strong>Judge0 API</strong> to execute user submissions across multiple programming languages.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Submissions are sent directly to Judge0, evaluated against hidden test cases in isolated containers, and synced with Neon PostgreSQL via Prisma.
              </p>
            </div>

            {/* Simulated Judge0 Log Terminal */}
            <div className="bg-slate-900 text-slate-300 rounded-2xl p-5 font-mono text-xs shadow-xl border border-slate-800">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800 text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="ml-2 text-slate-400">judge0-api.log</span>
              </div>
              <p className="text-emerald-400">$ POST http://localhost:2358/submissions</p>
              <p className="text-slate-400">[POST] Submission #1042 -&gt; Language ID: 54 (C++)</p>
              <p className="text-slate-400">[JUDGE0] Initializing Docker sandbox...</p>
              <p className="text-emerald-300">[JUDGE0] Status: 3 (Accepted)</p>
              <p className="text-slate-400">[METRICS] Time: 0.012s | Memory: 3248 KB</p>
              <p className="text-purple-300">[PRISMA] Record updated in Neon DB</p>
            </div>
          </section>

          {/* Architecture Highlights */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Core Architecture
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {architectureHighlights.map((item, idx) => (
                <div key={idx} className="bg-white/80 dark:bg-slate-900/60 border border-purple-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-xl w-fit mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Corrected Tech Stack Table */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="text-purple-600 dark:text-purple-400" /> Technology Stack
            </h2>
            <div className="overflow-hidden border border-purple-100 dark:border-slate-800 rounded-2xl bg-white/80 dark:bg-slate-900/40 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-purple-50/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-mono text-xs border-b border-purple-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6 font-semibold">Layer</th>
                    <th className="py-3.5 px-6 font-semibold">Technologies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-slate-800/60">
                  {techStack.map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/40 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-purple-600 dark:text-purple-300">{row.category}</td>
                      <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300 font-mono text-xs">{row.tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-purple-100 dark:border-slate-800/80 text-center text-xs text-slate-500">
            Code — Containerized Online Judge Platform
          </footer>
        </main>
      </div>
    </div>
  );
}