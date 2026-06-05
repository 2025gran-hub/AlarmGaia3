import { useState } from 'react';
import { codeFiles } from './data/codeFiles';
import CodeViewer from './components/CodeViewer';
import PhoneMockup from './components/PhoneMockup';
import WidgetMockup from './components/WidgetMockup';

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6M19 3l3 3" />
      </svg>
    ),
    title: 'Precise Alarm Scheduling',
    desc: 'Uses AlarmManager.setExactAndAllowWhileIdle() for API 23+ — fires on time even in Doze mode.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18" /><circle cx="6" cy="6" r="0.5" fill="currentColor" />
      </svg>
    ),
    title: 'Home Screen Widget',
    desc: 'Glance-based widget with live time, next alarm, and Snooze button. Updates every minute.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l18-8-8 18-2-8z" />
      </svg>
    ),
    title: 'Yandex Mobile Ads',
    desc: 'Banner integrated in MainActivity only. Widget remains 100% ad-free. Error fallback included.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-9-9c2.5 0 4.8 1 6.5 2.5M21 3v6h-6" />
      </svg>
    ),
    title: 'Boot Recovery',
    desc: 'BOOT_COMPLETED receiver restores alarm schedule after device reboot automatically.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z" /><path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Runtime Permissions',
    desc: 'Handles SCHEDULE_EXACT_ALARM (API 31+) and POST_NOTIFICATIONS (API 33+) gracefully.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'MVVM Architecture',
    desc: 'Clean separation with ViewModel + LiveData. Data persistence via SharedPreferences.',
    color: 'from-indigo-500 to-sky-600',
  },
];

const architectureFlow = [
  { step: 'User', desc: 'Sets time & label', icon: '👤' },
  { step: 'MainActivity', desc: 'Calls ViewModel', icon: '📱' },
  { step: 'AlarmViewModel', desc: 'Persists settings', icon: '🧠' },
  { step: 'AlarmManager', desc: 'Schedules exact alarm', icon: '⏰' },
  { step: 'AlarmReceiver', desc: 'Fires alarm, shows notification', icon: '🔔' },
];

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'app', label: 'App' },
  { id: 'widget', label: 'Widget' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'code', label: 'Source Code' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2 2" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">GaiaAlarm</span>
              <span className="text-[10px] text-slate-400 ml-1.5">v1.0.0</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6C20.6 22.3 24 17.8 24 12.5 24 5.9 18.6.5 12 .5z" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section id="overview" className="relative max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-medium text-cyan-300">Android · Kotlin · API 23+</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Wake up with{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                GaiaAlarm
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              A complete Android alarm clock application with a home screen widget and Yandex Mobile Ads integration.
              The widget is 100% ad-free — banners appear only in the main app screen.
              Built with MVVM, Jetpack Glance, and Material Design.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo('code')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
              >
                View Source Code →
              </button>
              <button
                onClick={() => scrollTo('features')}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Explore Features
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 max-w-md">
              <div>
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-slate-400">Source files</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">API 23</div>
                <div className="text-xs text-slate-400">Min SDK</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-xs text-slate-400">Widget ads</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-center">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Everything an alarm app should have
          </h2>
          <p className="text-slate-400 mt-2 max-w-2xl">
            From precise alarm scheduling to a beautiful home screen widget and thoughtfully integrated ads — GaiaAlarm covers it all.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-3 shadow-lg`}
              >
                <div className="w-5 h-5">{f.icon}</div>
              </div>
              <h3 className="font-bold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App + Widget comparison */}
      <section id="app" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">App Screens</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Two experiences, zero ads in the widget
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* App screen */}
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Main Activity
              </span>
              <span className="text-xs text-slate-500">Yandex Ads · Banner</span>
            </div>
            <div className="flex justify-center">
              <PhoneMockup />
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">TimePicker with hour/minute selection</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">Alarm label input field</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">Vibration toggle switch</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">⚡</span>
                <span className="text-slate-300">Yandex Mobile Ads banner (ad only here)</span>
              </div>
            </div>
          </div>

          {/* Widget */}
          <div id="widget" className="rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                Home Widget
              </span>
              <span className="text-xs text-slate-500">Ad-Free · Jetpack Glance</span>
            </div>
            <div className="flex justify-center py-4">
              <WidgetMockup />
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">Live current time (updates every minute)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">Next alarm display</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">Alarm label text</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">Snooze button (10 min postpone)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span className="text-slate-300">Zero advertising — purely functional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Architecture</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            How the alarm flows through the app
          </h2>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {architectureFlow.map((item, i) => (
              <div key={i} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-2xl mb-1.5">
                    {item.icon}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Step {i + 1}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-white truncate">{item.step}</div>
                  <div className="text-xs text-slate-400 truncate">{item.desc}</div>
                </div>
                {i < architectureFlow.length - 1 && (
                  <div className="hidden md:flex text-slate-600 text-xl flex-shrink-0">→</div>
                )}
              </div>
            ))}
          </div>

          {/* Tech stack */}
          <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Language', value: 'Kotlin' },
              { label: 'Architecture', value: 'MVVM' },
              { label: 'UI', value: 'Material 3' },
              { label: 'Widget', value: 'Glance' },
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t.label}</div>
                <div className="text-sm font-bold text-white mt-1">{t.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code */}
      <section id="code" className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Source Code</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Complete, production-ready Kotlin code
          </h2>
          <p className="text-slate-400 mt-2">
            Browse all 12 source files with syntax highlighting. Copy the code directly into your Android Studio project.
          </p>
        </div>

        <CodeViewer files={codeFiles} />

        {/* File structure tree */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <span className="text-sm font-bold text-white">Project Structure</span>
          </div>
          <pre className="text-xs font-mono text-slate-400 leading-relaxed overflow-x-auto">
{`GaiaAlarm/
├── app/
│   ├── build.gradle.kts                    ← Dependencies: Glance, Yandex Ads, Lifecycle
│   └── src/main/
│       ├── AndroidManifest.xml             ← Permissions, receivers, Yandex App ID
│       ├── java/com/gaiaalarm/
│       │   ├── GaiaAlarmApp.kt             ← Yandex SDK initialization
│       │   ├── MainActivity.kt             ← UI + TimePicker + Yandex Banner
│       │   ├── AlarmViewModel.kt           ← MVVM with LiveData
│       │   ├── AlarmReceiver.kt            ← Fires alarm, notification, vibration
│       │   ├── BootReceiver.kt             ← Restores alarm after reboot
│       │   ├── MyWidgetProvider.kt         ← Home screen widget (no ads!)
│       │   └── AdIds.kt                    ← Yandex Ad Unit constants
│       └── res/
│           ├── layout/
│           │   ├── activity_main.xml       ← TimePicker + Label + AdView
│           │   └── widget_layout.xml       ← Widget UI (ad-free)
│           └── xml/
│               └── widget_info.xml         ← Widget metadata
└── build.gradle.kts                        ← Project-level`}
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <circle cx="12" cy="13" r="8" />
              </svg>
            </div>
            <span className="font-bold text-slate-300">GaiaAlarm</span>
          </div>
          <p className="text-xs">
            Built with Kotlin · AlarmManager · Jetpack Glance · Yandex Mobile Ads · Material Design
          </p>
          <div className="flex-1" />
          <p className="text-xs">© 2025 GaiaAlarm. All alarms reserved.</p>
        </div>
      </footer>
    </div>
  );
}
